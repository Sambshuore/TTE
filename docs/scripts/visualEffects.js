(()=>{var r=null,a=null,s=!1;document.addEventListener("DOMContentLoaded",function(){let t=document.querySelector("#nav-bar__title");t.addEventListener("mouseenter",p),t.addEventListener("mouseleave",g),r=document.querySelector("#scroll__button--to-top"),a=document.documentElement,r.addEventListener("click",E),document.addEventListener("scroll",y),document.querySelectorAll(".nav-bar__tab-bar--links").forEach(e=>{e.addEventListener("mouseover",()=>{f(e,e.dataset.section)}),e.addEventListener("mouseleave",()=>{v(e)})})},!1);function p(t){s=!0,requestAnimationFrame(d)}function g(t){s=!1}function d(t){if(s){let e=document.querySelector("#nav-bar__title__logo"),l=getComputedStyle(e,null).getPropertyValue("transform").split("(")[1].split(")")[0].split(","),c=l[0],u=l[1],m=Math.atan2(u,c)*(180/Math.PI),i=1+m;i<0&&(i=i+360),e.style.transform="rotate("+i+"deg)",requestAnimationFrame(d)}}function f(t,e){let o=document.createElement("tooltip");o.id="nav-bar__tooltip";let n=document.createTextNode(e);e!=null&&(o.innerHTML="",o.appendChild(n),document.getElementsByTagName("tooltip")[0]&&document.getElementsByTagName("tooltip")[0].remove(),o.style.top=event.pageY+20+"px",o.style.left=event.pageX+20+"px",document.body.appendChild(o))}function v(t){document.getElementsByTagName("tooltip")[0].remove()}function y(){let t=a.scrollHeight-a.clientHeight,e=document.getElementById("table-of-contents"),o=0;if(e!=null){let n=document.body.getBoundingClientRect(),l=e.getBoundingClientRect(),c=l.top-n.top;c>0&&(o=c)}(a.scrollTop-o)/t>.05?r.classList.add("scroll__button--to-top--show"):r.classList.remove("scroll__button--to-top--show")}function E(){let t=document.getElementById("table-of-contents"),e=0;if(t!=null){let o=document.body.getBoundingClientRect(),n=t.getBoundingClientRect(),l=n.top-o.top;l>0&&(e=l-100)}a.scrollTo({top:e,behavior:"smooth"})}})();