const extVersion = chrome.runtime.getManifest().version;

const inject = async (branch, version) => {
  console.log('[banefyre-ext] Injecting...');

  window.gmExtension = version;

  const branchURLs = {
    release: 'https://api.goosemod.com/inject.js',
    dev: 'https://raw.githubusercontent.com/bonefire-mod/banefyre/dist-dev/index.js',
    local: 'http://localhost:1234/index.js'
  };

  console.log('[banefyre-ext] Branch =', branch);
  console.log('[banefyre-ext] JS Url =', branchURLs[branch]);
  
  const js = await (await fetch(branchURLs[branch])).text(); // JSON.parse(localStorage.getItem('goosemodCoreJSCache'));

  const el = document.createElement('script');
  
  el.appendChild(document.createTextNode(js));
  
  document.body.appendChild(el);

  console.log('[banefyre-ext] Injected fetched JS');
};
