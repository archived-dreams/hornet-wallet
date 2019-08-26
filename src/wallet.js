class Wallet {
  /**
   * Create wallet
   * @param {HTMLElement} element - Root dom element
   */
  constructor(element) {
    this.root = element;
    this.wallet = this.create_wallet();
    this.transactions = this.wallet.getElementsByClassName("transactions")[0].getElementsByTagName("div")[0];
    this.transfers = {};

    // States
    this.states = {
      transactions_opened: "state--open-transactions",
      loading: "state--loading"
    };

    // Load main data
    this.reload(undefined, true);

    // Trigger :: Collapse Transactions
    this.wallet
      .getElementsByClassName("action--transactions")[0]
      .addEventListener("click", e => this.collapse_transactions(e));

    // Trigger :: Reload all data
    this.wallet
      .getElementsByClassName("action--refresh")[0]
      .addEventListener("click", e => this.reload(e));

    // Trigger :: Show Transaction Details
    this.transactions.addEventListener('click', e => this.transaction_details(e))

    // Trigger :: Preload Transactions on scroll
    this.transactions.addEventListener("scroll", () => this.preload_transactions_on_scroll());

    // Trigger :: Copy wallet
    this.wallet
      .getElementsByClassName("info-id")[0]
      .getElementsByTagName("span")[0]
      .addEventListener("click", e => this.copy_wallet())
  }

  /**
   * Reload data
   * @param {*} e
   */
  reload(e, without_transactions = false) {
    // Prevent click
    if (e !== undefined) {
      e.preventDefault();
    }

    // Loading status
    if (this.loading(false)) {
      return;
    }
    this.loading(false, true);

    // Reload transactions
    let reload_transactions = () => {
      if (
        !this.loading("transactions") &&
        !without_transactions
      ) {
        // Clear transactions list
        this.transactions.innerHTML = "";
        this.transfers = {};
        delete this.pagination_identifier;

        // Load transactions if block opened
        this.wallet.classList.contains(this.states.transactions_opened) && this.load_transactions()
      }
    }

    // Reload main info
    this.api({
      action: "get_wallet"
    }).then(response => {

      // Balance
      let balance = this.wallet.getElementsByClassName("balance")[0].getElementsByTagName("span")[0];
      balance.innerHTML = Number(response.available_balance).toLocaleString();

      // Address
      let address = this.wallet.getElementsByClassName("info-id")[0].getElementsByTagName("span")[0];
      address.innerHTML = this._(response.token_holder_address);


    }).finally(() => {
      reload_transactions();
      this.loading(false, false);
    });

  }

  /**
   * Open/Close Transactions block
   * @param {*} e
   */
  collapse_transactions(e) {
    // Prevent click
    if (e !== undefined) {
      e.preventDefault();
    }

    // Load transactions
    if (
      this.pagination_identifier === undefined &&
      !this.loading("transactions") &&
      !this.wallet.classList.contains(this.states.transactions_opened)
      ) {
      this.load_transactions("");
    }

    // Open
    if (!this.wallet.classList.contains(this.states.transactions_opened)) {
      // Scroll to top
      this.transactions.scrollTop = 0;
      // Reset Transaction Details
      let transfer = this.transactions.querySelector('.transaction--details');
      if (transfer) {
        transfer.remove();
      }
    }

    // Collapse
    this.wallet.classList.toggle(this.states.transactions_opened);
  }

  /**
   * Preload transactions on scroll
   */
  preload_transactions_on_scroll(){
    if (
      (
        this.transactions.scrollHeight
        - this.transactions.scrollTop
        - this.transactions.offsetHeight * 2
      ) < 100 &&
      !this.loading("transactions")
    ) {
      this.load_transactions();
    }
  }

  /**
   * Load transactions
   * @param {*} page
   */
  load_transactions(pagination_identifier) {
    // Loading status
    if (this.loading("transactions")) { return; }
    this.loading("transactions", true);

    let page = pagination_identifier || this.pagination_identifier;
    this.api({
      action: "get_ledger",
      pagination_identifier: page
    }).then(response => {

      // Next page
      this.pagination_identifier = response.meta.next_page_payload

      // Transactions
      for (let transaction of response.transactions) {

        // Icon
        let icon;
        if (transaction.meta_property.name === "community reward") {
          icon = "community_reward";
        } else if (transaction.meta_property.name === "shop_payment") {
          icon = "shop_payment";
        }

        // Transfer
        let transfer = transaction.transfers[0];

        // Type
        let type = transfer.from === this.wallet_address ? "debt" : "income";

        // Second user name
        let user = {
          name: transfer[`${ type === "debt" ? "to" : "from" }_name`],
          address: transfer[type === "debt" ? "to" : "from"]
        };

        // Title
        let title = transaction.meta_property.name;
        let details = String(transaction.meta_property.details).trim();
        if (details !== "") {
          title += ` (${details})`;
        }

        // Date
        let time = new Date(transaction.updated_timestamp * 1000);

        // Amount
        let amount = transfer.amount;

        // Add transaction to dom
        let element = document.createElement("div");
        element.className = `transaction--block`;
        element.setAttribute("data-id", transaction.id);
        element.innerHTML =
          // Main Transaction info
          `<div class="transaction--info transaction--type-${type}">` +
            // Icon
            `<div class="transaction--icon">` +
              `<div class="transaction--icon--${icon || "none"}"></div>` +
            `</div>` +
            // Summary
            `<div class="transaction--summary">` +
              // Title
              `<span class="transaction--title">${this._(title)}</span>` +
              // User
              `<span class="transaction--user">` +
                this._(user.name) +
              `</span>` +
              // Date
              `<span class="transaction--time">${time.toLocaleString()}</span>` +
            `</div>` +
            // Ammount
            `<div class="transaction--amount">` +
                amount +
              `<span>Tokens</span>` +
            `</div>` +
          `</div>`;

          this.transfers[transaction.id] = transaction;
          this.transactions.appendChild(element);
      }

      // Add to dom
    }).finally(() => this.loading("transactions", false));
  }

  /**
   * Show Transaction Details
   * @param {*} e
   */
  transaction_details(e) {
    e.preventDefault();

    // Root element
    let block = e.target || null;
    while (true) {
      if (block === null) {
        return;
      } else if (block.classList.contains("transaction--info")) {
        block = block.parentElement;
        break;
      } else {
        block = block.parentElement;
      }
    }

    let transaction = this.transfers[block.getAttribute('data-id') || ''];

    // Transactionn not found
    if (!transaction) {
      return;
    }

    // Hide
    if (block.getElementsByClassName("transaction--details").length > 0) {
      block.getElementsByClassName("transaction--details")[0].remove();
    }

    // Show
    else {
      // Transfer
      let transfer = transaction.transfers[0];

      // Type
      let type = transfer.from === this.wallet_address ? "debt" : "income";

      // Content
        let element = document.createElement("div");
        element.className = `transaction--details`;
        element.innerHTML =
          // Overview
          `<span>Status:</span> ${transaction.status}<br>` +
          `<span>Type:</span> ${transaction.meta_property.type}<br><br>` +

          // User
            (
              type === "debt" ?
              // To
              `<span class="primary">To</span><br>` +
              `<span>Name:</span> ${this._(transfer.to_name)}<br>` +
              `<span>Address:</span> <span class="small">${this._(transfer.to)}</span><br>` +
              `<span>User ID:</span> <span class="small">${this._(transfer.to_user_id)}</span><br><br>`:

              // From
              `<span class="primary">From</span><br>` +
              `<span>Name:</span> ${this._(transfer.from_name)}<br>` +
              `<span>Address:</span> <span class="small">${this._(transfer.from)}</span><br>` +
              `<span>User ID:</span> <span class="small">${this._(transfer.from_user_id)}</span><br><br>`
            ) +

          // Technical info
          `<span class="primary">Technical info</span><br>` +
          `<span>ID:</span> <span class="small">${transaction.id}</span><br>` +
          `<span>Hash:</span> <span class="small">${transaction.transaction_hash}</span><br>` +
          `<span>Block:</span> #${transaction.block_number} <span class="small">(${(new Date(transaction.block_timestamp * 1000)).toLocaleString()})</span>`;


      // Close other
      let old = this.transactions.querySelector('.transaction--details');
      if (old) {
        old.remove();
      }

      // Print
      block.appendChild(element);

      // Scroll to block
      // block.scrollIntoView(false);
      this.transactions.scrollTop = block.offsetTop;

    }
  }

  /**
   * Loading state
   * @param {String} block
   * @param {Boolean} status
   */
  loading(block = false, state) {
    let class_name = `${this.states.loading}${block ? `--${block}` : ""}`;
    switch (state) {
      case false:
        this.wallet.classList.remove(class_name);
        break;
      case true:
        this.wallet.classList.add(class_name);
        break;
      default:
        return this.wallet.classList.contains(class_name);
    }
  }

  /**
   * Data load
   * @param {object} data
   */
  api(data) {

    // Production
    if (process.env.NODE_ENV === "production") {
      return new Promise((resolve, reject) => {
        $.ajax({
          method: "POST",
          dataType: "json",
          url: "/community/wp-admin/admin-ajax.php?lang=en&bpml_filter=true",
          data,
          success: response => {
            resolve(response);
          },
          error: function (error) {
            reject(error);
          }
        });
      });
    }

    // Demo
    else {
      return new Promise(resolve => {
        import("faker").then(faker => {
          setTimeout(() => {
            switch (data.action) {
              case "get_wallet":
                resolve({
                  available_balance: ~~faker.finance.amount(100, 3000000),
                  lgbtt_user_id: faker.random.uuid(),
                  token_balance: 0,
                  token_holder_address: faker.finance.bitcoinAddress(),
                  total_balance: ~~faker.finance.amount(100, 3000000),
                  user_id: faker.random.number(),
                  wallet_status: "ACTIVATED",
                  wallet_status_hint: ""
                });
                break;
              case "get_ledger":
                resolve({
                  lgbtt_user_id: faker.finance.bitcoinAddress(),
                  user_id: faker.random.number(),
                  meta: {
                    next_page_payload:
                      "eyJmcm9tIjoyMCwibGltaXQiOjIwLCJtZXRhX3Byb3BlcnR5IjpbXSwic3RhdHVzIjpbXX0=",
                    total_no: faker.random.number()
                  },
                  transactions: (() => {
                  let transactions = [];
                  for (let i = 0; i < 20; i++) {
                    let is_income = Math.floor(0 + Math.random() * 3) !== 2 ? true : false;

                    transactions.push({
                        block_confirmation: faker.random.number(),
                        block_number: faker.random.number(),
                        block_timestamp: ~~(faker.date.past() / 1000),
                        from: faker.finance.bitcoinAddress(),
                        gas_price: "1000000000",
                        gas_used: faker.random.number(),
                        id: faker.random.uuid(),
                        meta_property: (() => {
                          if (is_income) {
                            let is_testing = Math.floor(0 + Math.random() * 4) === 3;
                            return {
                                details: is_testing ? "Community rewards" : `help_forum ${faker.random.number()}`,
                                name: is_testing ? "Testing" : "community reward",
                                type: "company_to_user"
                              };
                            } else {
                            return {
                                details: `1_${faker.random.number()}`,
                                name: "shop_payment",
                                type: "user_to_company"
                              };
                            }
                        })(),
                        nonce: faker.random.number(),
                        rule_name: "Direct Transfer",
                        status: "SUCCESS",
                        to: faker.finance.bitcoinAddress(),
                        transaction_fee: "109362000000000",
                        transaction_hash: faker.finance.bitcoinAddress(),
                        transfers: [
                          {
                            amount: ~~faker.finance.amount(),
                            from: is_income ? faker.finance.bitcoinAddress() : this.wallet_address,
                            from_name: faker.internet.userName(),
                            from_user_id: faker.random.uuid(),
                            kind: "transfer",
                            to: !is_income ? faker.finance.bitcoinAddress() : this.wallet_address,
                            to_name: faker.internet.userName(),
                            to_user_id: faker.random.uuid()
                          }
                        ],
                        updated_timestamp: ~~(faker.date.past() / 1000),
                        value: "0"
                      });
                    }
                    return transactions;
                  })(),
                  updated_timestamp: ~~(faker.date.past() / 1000),
                  value: "0"
                });
                break;
              default:
                resolve({});
            }
          }, 1500);
        });
      });
    }
  }

  /**
   * Copy wallet address
   */
  copy_wallet() {
    let address = this.wallet.getElementsByClassName("info-id")[0].getElementsByTagName("span")[0].innerText;
    address = String(address).trim();

    try {
      navigator.clipboard.writeText(address).then(() => {
        this.notify("Wallet ID copied!");
      }, err => console.error(`Copying error: ${err}`));
    } catch (e) {}
  }

  /**
   * Notification
   * @param {String} message
   */
  notify(message, timer = 1500) {
      if (this.wallet.getElementsByClassName('wallet--nofication').length > 0) {
        return;
      }

      // Create notification
      let element = document.createElement("div");
      element.className = `wallet--nofication`;
      element.innerHTML = message
      let notification = this.wallet.appendChild(element);

      // Lifecycle
      setTimeout(() => {
        notification.classList.add('wallet--nofication--show');
        setTimeout(() => {
          notification.classList.remove('wallet--nofication--show');
          setTimeout(() => {
            notification.remove();
          }, 300);
        }, timer);
      }, 100)
  }

  /**
   * Html Entities helper
   * @param {*} str
   */
  _(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /**
   * Create Wallet dom
   */
  create_wallet() {
    let element = document.createElement("div");
    element.className = "w-wallet";
    element.innerHTML =
      // Summary
      `<div class="summary">` +
        `<div>` +
          // Title
          `<span class="title">Your wallet</span>` +
          // ID
          `<div class="info-id">ID: <span></span></div>` +
          // Balance
          `<div class="balance">` +
            `<span></span><br>` +
            `LGBT Tokens` +
          `</div>` +
          // Actions
          `<div class="actions">` +
            // Refresh
            `<a href="#" class="action--refresh" title="Refresh"><span></span></a>` +
            // Recent Transactions
            `<a href="#" class="action--transactions">` +
              `Recent Transactions` +
            `</a>` +
          `</div>` +
        `</div>` +
      `</div>` +
      // Transactions
      `<div class="transactions"><div></div></div>`;

    return this.root.appendChild(element);
  }
}

if (window !== undefined) {
  window._Wallet = Wallet;
}

export default Wallet;