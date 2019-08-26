import "./demo.scss";

import "./wallet.scss";
import Wallet from "./wallet.js";

document.wallet = new Wallet(
  document.getElementById("WalletWidgetBlock")
);


/**
 * Below is a hell for a perfectionist
 */

let body = document.body;
let wallet = document.getElementsByClassName("w-wallet")[0];
let transactions = wallet.getElementsByClassName("transactions")[0].getElementsByTagName("div")[0];
let transactionsAction = wallet.getElementsByClassName(
  "action--transactions"
)[0];
let reloadAction = wallet.getElementsByClassName("action--refresh")[0];

let polling = null;

/**
 * Resize
 */
let sizes = document.getElementById("size").getElementsByTagName("a");
let resizeBlock = document.getElementById("WalletWidgetBlock");
for (let element of sizes) {
  element.addEventListener("click", e => {
    e.preventDefault();
    switch (element.getAttribute("data-size")) {
      case "small":
        resizeBlock.style["width"] = "216px";
        wallet.style["font-size"] = "14px";
        break;
      default:
        resizeBlock.style["width"] = "100%";
        wallet.style["font-size"] = "1rem";
    }
  });
}

/**
 * Color
 */
document.getElementById("color").addEventListener("click", e => {
  e.preventDefault();
  document.body.classList.toggle("light");
});

/**
 * Tour
 */

// Tour
let tour = document.getElementById("runTour");
let leftElement = tour.getElementsByClassName("left")[0];
tour.addEventListener("click", e => {
  e.preventDefault();

  wallet.classList.remove("state--loading");
  wallet.classList.remove("state--open-transactions");
  clearTimeout(polling);
  polling = null;

  let left = 21;
  let interval = setInterval(() => {
    left--;
    if (left === 0) {
      body.classList.remove("tour");
      clearInterval(interval);
    }
    leftElement.getElementsByTagName("span")[0].innerHTML = left;
  }, 1000);

  leftElement.getElementsByTagName("span")[0].innerHTML = left;
  body.classList.add("tour");

  reloadAction.click();
  setTimeout(() => transactionsAction.click(), 2500);
  setTimeout(() => {
    scrollTo(transactions, transactions.scrollHeight - 300, 5000);

    setTimeout(() => {
      scrollTo(transactions, 0, 1000);
      setTimeout(() => {
        transactions.firstChild.firstChild.click();
        setTimeout(() => {
          scrollTo(transactions, 65, 1500);
          setTimeout(() => {
            document.wallet.notify("Wallet ID copied!");
          }, 2900);
        }, 500);
      }, 1500);
    }, 5000 + 1500);

  }, 5000);
  setTimeout(() => transactionsAction.click(), 12500 + 1500 + 1500 + 2000 + 1500);
});

function scrollTo(element, to, duration) {
  var start = element.scrollTop,
    change = to - start,
    currentTime = 0,
    increment = 16;

  var animateScroll = function() {
    currentTime += increment;
    var val = Math.easeInOutQuad(currentTime, start, change, duration);
    element.scrollTop = val;
    if (currentTime < duration) {
      setTimeout(animateScroll, increment);
    }
  };
  animateScroll();
}

Math.easeInOutQuad = function(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t + b;
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
};
