import "./style.scss";

let body = document.body;
let wallet = document.getElementsByClassName("w-wallet")[0];
let transactions = wallet.getElementsByClassName("transactions")[0];
let transactionsAction = wallet.getElementsByClassName(
  "action--transactions"
)[0];
let reloadAction = wallet.getElementsByClassName("action--refresh")[0];

let polling = null;

// Open/Close Transactions
transactionsAction.addEventListener("click", e => {
  e.preventDefault();
  if (!wallet.classList.contains("state--open-transactions")) {
    reloadAction.click();
  }
  wallet.classList.toggle("state--open-transactions");
});

// Reload action
reloadAction.addEventListener("click", e => {
  e.preventDefault();
  if (!wallet.classList.contains("state--loading")) {
    transactions.innerHTML = "";
    wallet.classList.add("state--loading");
    polling = setTimeout(() => {
      generate_transactions();
      // Generate balance
      // wallet
      //   .getElementsByClassName("balance")[0]
      //   .getElementsByTagName("span")[0].innerHTML = [
      //   pad(rand(1, 9), 1),
      //   pad(rand(0, 999), 3),
      //   pad(rand(0, 999), 3)
      // ].join(",");
      wallet
        .getElementsByClassName("balance")[0]
        .getElementsByTagName("span")[0].innerHTML = rand(
        100,
        [9999999, 1000000][rand(0, 1)]
      ).toLocaleString();
      // console.log(rand(0, 3));

      wallet.classList.remove("state--loading");
      polling = null;
    }, 1500);
  }
});

// Generate transactions
let generate_transactions = () => {
  let html = "";

  for (let i = 0; i <= 25; i++) {
    // Date
    let time = new Date();
    time.setMinutes(time.getMinutes() - i * 1.348);
    time = time.toLocaleString();

    // Type
    let type = ["income", "debt"][rand(0, 1)];

    // Amount
    let amount = [rand(9, 99), rand(100, 999), rand(1000, 5500)][rand(0, 2)];

    // Title
    let title;
    switch (type) {
      case "income":
        title = [
          "community reward, company_to_user, help_forum 166054",
          "Testing, company_to_user, Community rewards",
          "community reward, company_to_user, 165507",
          "community reward, company_to_user, help_forum 165580",
          "community reward, company_to_user, beta_testers 166796",
          "community reward, company_to_user, 167611"
        ][rand(0, 5)];
        break;
      default:
        title = [
          "shop_payment, user_to_company, 1_314035",
          "shop_payment, user_to_company, 1_314041"
        ][rand(0, 1)];
    }

    // Icon
    let icon = title.split(",")[0].replace(" ", "_");

    // Html
    html += `
      <div class="transaction--type-${type}">
        <!-- Icon -->
        <div class="transaction--icon">
          <div class="transaction--icon--${icon}"></div>
        </div>
        <!-- Summary -->
        <div class="transaction--summary">
          <!-- Title -->
          <span class="transaction--title">${title}</span>
          <!-- Date -->
          <span class="transaction--time">${time}</span>
        </div>
        <!-- Ammount -->
        <div class="transaction--amount">
          ${amount}
          <span>Tokens</span>
        </div>
      </div>
    `;
  }

  transactions.innerHTML = html;
};

// Loading state
reloadAction.click();
// transactionsAction.click();

/**
 * Helpers
 */

function pad(str, max) {
  str = str.toString();
  return str.length < max ? pad("0" + str, max) : str;
}

function rand(min, max) {
  return Math.floor(min + Math.random() * (max + 1 - min));
}

/**
 * Resize
 */
let sizes = document.getElementById("size").getElementsByTagName("a");
let resizeBlock = document.getElementById("resizeBlock");
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

  let left = 13;
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
    scrollTo(transactions, Math.floor(transactions.scrollHeight / 2), 3500);
  }, 4800);
  setTimeout(() => transactionsAction.click(), 12500);
});

function scrollTo(element, to, duration) {
  var start = element.scrollTop,
    change = to - start,
    currentTime = 0,
    increment = 10;

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
