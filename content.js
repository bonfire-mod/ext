const extVersion = chrome.runtime.getManifest().version;

const inject = async (branch, version) => {
  console.log('[bonfire-ext] Injecting...');

  window.bfExtension = version;

  const branchURLs = {
    release: 'https://raw.githubusercontent.com/bonfire-mod/bonfire/dist-prod/index.js',
    dev: 'https://raw.githubusercontent.com/bonfire-mod/bonfire/dist-dev/index.js',
    local: 'http://localhost:1234/index.js'
  };

  console.log('[bonfire-ext] Branch =', branch);
  console.log('[bonfire-ext] JS Url =', branchURLs[branch]);
  
  const js = await (await fetch(branchURLs[branch])).text(); // JSON.parse(localStorage.getItem('goosemodCoreJSCache'));

  const el = document.createElement('script');
  
  el.appendChild(document.createTextNode(js));
  
  document.body.appendChild(el);

  console.log('[bonfire-ext] Injected fetched JS');
};

// Extension Storage (v10)
const storageCache = {};

chrome.storage.local.get(null, (data) => {
  Object.assign(storageCache, data);

  if (Object.keys(storageCache).length === 0 && Object.keys(localStorage).find((x) => x.toLowerCase().startsWith('goosemod'))) { // Nothing stored in Extension storage and something GM in localStorage - migrate from LS to Ext
    const gmKeys = Object.keys(localStorage).filter((x) => x.toLowerCase().startsWith('goosemod'));

    const setObj = {};

    for (const k of gmKeys) {
      setObj[k] = localStorage.getItem(k);
      localStorage.removeItem(k);
    }

    console.log('[bonfire-ext] Migrated from localStorage to Extension', setObj);

    Object.assign(storageCache, setObj);
    chrome.storage.local.set(setObj);
  }


  const el = document.createElement('script');

  el.appendChild(document.createTextNode(`(${inject.toString()})(${JSON.stringify('release')}, ${JSON.stringify(extVersion)})`));

  document.body.appendChild(el);
});


document.addEventListener('gmes_get', ({ }) => {
  document.dispatchEvent(new CustomEvent('gmes_get_return', {
    // Firefox requires cloneInto as doesn't like sending objects from content -> page
    detail: typeof cloneInto === 'undefined' ? storageCache : cloneInto(storageCache, window) 
  }));
});

document.addEventListener('gmes_set', ({ detail: { key, value }}) => {
  storageCache[key] = value; // Repopulate cache with updated value

  const obj = {}; // Create object for set
  obj[key] = value;

  chrome.storage.local.set(obj); // Actually store change
});

document.addEventListener('gmes_remove', ({ detail: { key }}) => {
  delete storageCache[key]; // Repopulate cache with updated value

  chrome.storage.local.remove(key); // Actually store change
}); 
