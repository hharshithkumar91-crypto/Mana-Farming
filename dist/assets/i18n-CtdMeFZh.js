let n=localStorage.getItem("mf_lang")||"en";function t(){return n}function a(e){n=e,localStorage.setItem("mf_lang",e),window.dispatchEvent(new Event("langchange"))}export{t as g,a as s};
