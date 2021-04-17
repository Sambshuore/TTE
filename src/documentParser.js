import unified from "unified";
import markdown from "remark-parse";
import remark2rehype from "remark-rehype";
import stringify from "rehype-stringify";
import gfm from "remark-gfm";
import slug from "remark-slug";
import toc from "remark-toc";
import math from "remark-math";
import katex from "rehype-katex";
import emoji from "remark-emoji";
import directive from "remark-directive";
import visit from "unist-util-visit";
import h from "hastscript";

//Actions taken on DOM Load
document.addEventListener(
  "DOMContentLoaded",
  function () {
    // Load news
    loadNewsSection();
    // Enable smooth scroll on hash links
    enableSmoothTOC();
    // Add page change events to nav-bar
    document
      .querySelectorAll("div#nav-bar__title, img.nav-bar__tab-bar--links")
      .forEach((item) => {
        addPageChangeEvent(item);
      });
  },
  false
);

// --- Functions related to file parsing
function loadFile(filePath) {
  //XMLHTTP request for a file in the project folder (valid path needed). No need for CORS treatment since it is from the same source
  let result = null;
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  xmlhttp.send();
  if (xmlhttp.status == 200) {
    result = xmlhttp.responseText;
  }
  //Return text result
  return result;
}

function parseGFM(file) {
  //Read GFM file
  let fileData = loadFile(file.toLowerCase() + ".md");
  if (fileData.length <= 1 || fileData == null) {
    return "";
  }
  let content = "";
  //Using the unified environment, transform the text GFM format to HTML to be injected into the page
  //Also supports LaTeX-like math, Table of Contents, custom directives, emojis...
  unified()
    .use(toc, { parents: ["root", "containerDirective"] })
    .use(markdown)
    .use(directive)
    .use(htmlDirectives)
    .use(gfm)
    .use(slug)
    .use(math)
    .use(remark2rehype)
    .use(katex)
    .use(emoji)
    .use(stringify)
    .process(fileData, function (err, file) {
      if (err) {
        console.log(err);
      } else {
        content = file;
      }
    });
  //Return the HTML data
  return content;
}

// --- Functions related to custom directives
function htmlDirectives() {
  return transform;

  function transform(tree) {
    //For different directives on the tree, run onDirective()
    visit(
      tree,
      ["textDirective", "leafDirective", "containerDirective"],
      onDirective
    );
  }

  function onDirective(node) {
    //Gets data from the node
    let data = node.data || (node.data = {});
    let hast = h(node.name, node.attributes);

    //From that data, a new div will be created
    data.hName = "div";
    //Assign tags and properties from node to the div, which will be used by other functions
    hast.properties = Object.assign({ class: hast.tagName }, hast.properties);
    data.hProperties = hast.properties;
  }
}

// --- Functions related to the NEWS section
function parseNewsContent(page, number) {
  //Define DOMParser object and a placeholder for the content of each card on the NEWS section
  const parser = new DOMParser();
  let cardContents = "";

  //Parse the result from unified (parseGFM) into usable HTML
  const doc = parser.parseFromString(page, "text/html");

  //Get tags from the first child (first heading), which are saved as JSON
  let docTextData = doc.body.firstChild.dataset.tags;
  let docData = JSON.parse(docTextData.replace(/'/g, '"'));

  //Create the card HTML
  cardContents = cardContents.concat(
    '<figure class= "card-container__figure" data-document= "news/news'
  );
  cardContents = cardContents.concat(number);
  cardContents = cardContents.concat('" style="background-image: url(');
  cardContents = cardContents.concat(docData.media);
  cardContents = cardContents.concat(
    ');"><div class="card-container__date"><span class="card-container__date--day">'
  );
  cardContents = cardContents.concat(docData.dateDay);
  cardContents = cardContents.concat(
    '</span><span class="card-container__date--month">'
  );
  cardContents = cardContents.concat(docData.dateMonth);
  cardContents = cardContents.concat(
    '</span></div><figcaption class= "card-container__figure--caption"><h4> <span>'
  );
  cardContents = cardContents.concat(doc.body.firstChild.textContent);
  cardContents = cardContents.concat("</span></h4><p>");
  cardContents = cardContents.concat(docData.description);
  cardContents = cardContents.concat("</p></figcaption></figure>");

  //Return the full card HTML data
  return cardContents;
}

function loadNewsSection() {
  //Get the section text and update it to NEWS
  let sectionText = document.getElementById("section-container__text");
  sectionText.innerHTML = "NEWS";

  //Create a container for the cards to be added
  let cardContainer = '<div class="card-container">';
  let cardContents = "";

  //For each possible file, parse their content and add the card to the container
  let newsPage1 = parseGFM("news/news1");
  if (!!newsPage1) {
    cardContents = cardContents.concat(parseNewsContent(newsPage1, 1));
  }

  let newsPage2 = parseGFM("news/news2");
  if (!!newsPage2) {
    cardContents = cardContents.concat(parseNewsContent(newsPage2, 2));
  }

  let newsPage3 = parseGFM("news/news3");
  if (!!newsPage3) {
    cardContents = cardContents.concat(parseNewsContent(newsPage3, 3));
  }

  //Close the container and update the content block on the page
  cardContainer = cardContainer.concat(cardContents + "</div>");
  let contentText = document.getElementById("content");
  contentText.innerHTML = cardContainer;

  //Add change page events for each cart (to their respective pages)
  document.querySelectorAll(".card-container__figure").forEach((item) => {
    addPageChangeEvent(item);
  });
  enableSmoothTOC();
}

// --- Function for click events on the nav-bar
function addPageChangeEvent(item) {
  item.addEventListener("click", (event) => {
    // Variables to cosmetic modifications on the page
    let i, tabContent, tabLinks;

    // Get all elements with class="nav-bar__tab-bar--content" and hide them
    tabContent = document.getElementsByClassName("nav-bar__tab-bar--content");
    for (i = 0; i < tabContent.length; i++) {
      tabContent[i].style.display = "none";
    }

    // Get all elements with class="nav-bar__tab-bar--links" and remove the class "active"
    tabLinks = document.getElementsByClassName("nav-bar__tab-bar--links");
    for (i = 0; i < tabLinks.length; i++) {
      tabLinks[i].className = tabLinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab;
    if (event.currentTarget.dataset.document != "NEWS") {
      event.currentTarget.className += " active";
    }

    // Get the section and content elements to change the document presented on the page
    let sectionText = document.getElementById("section-container__text");
    let contentText = document.getElementById("content");

    if (event.currentTarget.dataset.document == "NEWS") {
      //If the event is tagged as "NEWS" (nav-bar logo redirect)
      //Card based view
      loadNewsSection();
    } else {
      //Continuous page view
      if (event.currentTarget.dataset.document.includes("news")) {
        //If the event uses the news folder (document includes news string), set the section as news and update the content
        sectionText.innerHTML = "NEWS";
        contentText.innerHTML = parseGFM(event.currentTarget.dataset.document);
      } else {
        //Event is a tech document, set the section as the game name and update the content
        sectionText.innerHTML = event.currentTarget.dataset.section;
        contentText.innerHTML = parseGFM(
          "./tech/" + event.currentTarget.dataset.document
        );
      }
    }
    //Enable smooth TOC if it exists in the loaded content
    enableSmoothTOC();
  });
}

// --- Function for click events on the nav-bar
function enableSmoothTOC() {
  //Gets all hash events
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      //Add smooth behaviour to all matches
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });
    });
  });
}