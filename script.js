document.addEventListener("DOMContentLoaded", () => {
    const portfolioForm = document.getElementById("portfolio-form");
    const portfolioList = document.getElementById("portfolio-list");
    const stockSearchInput = document.getElementById("stock-search");
    const searchButton = document.getElementById("search-button");
    const stockTableBody = document.getElementById("stock-table-body");
    const stockModal = document.getElementById("stock-modal");
    const modalDetails = document.getElementById("modal-stock-details");
    const closeModal = document.getElementById("close-modal");

    const stockData = [
        { name: "TATA", symbol: "TT", price: "Rs 120", change: "+1.2%" },
        { name: "WIPRO", symbol: "WIP", price: "Rs 230", change: "-0.5%" },
        { name: "MAHINDRA", symbol: "M&M", price: "Rs 130", change: "+2.3%" },
        { name: "INFOSYS", symbol: "INF", price: "Rs 150", change: "+0.8%" },
        { name: "HCL", symbol: "HCL", price: "Rs 110", change: "-1.5%" },
        { name: "HDFC BANK", symbol: "HDFCB", price: "Rs 160", change: "+1.1%" },
        { name: "ICICI BANK", symbol: "ICICIB", price: "Rs 170", change: "+0.7%" },
        { name: "AXIS BANK", symbol: "AXISB", price: "Rs 180", change: "-0.3%" },
        { name: "RELIANCE", symbol: "RELI", price: "Rs 190", change: "+0.9%" },
    ];

    const populateStockTable = () => {
        stockTableBody.innerHTML = "";
        stockData.forEach((stock) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${stock.name}</td>
                <td>${stock.symbol}</td>
                <td>${stock.price}</td>
                <td>${stock.change}</td>
                <td><button class="details-button" data-symbol="${stock.symbol}">Details</button></td>
            `;
            stockTableBody.appendChild(row);
        });
    };

    fetch("http://localhost:8000/api/portfolio")
        .then((res) => res.json())
        .then((data) => {
            data.forEach((stock) => {
                addToPortfolioDOM(stock.stock_name, stock.quantity, stock.price);
            });
        })
        .catch((err) => console.error("Failed to fetch portfolio:", err));

    const showStockDetails = (symbol) => {
        const stock = stockData.find((s) => s.symbol === symbol);
        if (stock) {
            modalDetails.textContent = `Name: ${stock.name}, Symbol: ${stock.symbol}, Price: ${stock.price}, Change: ${stock.change}`;
            stockModal.style.display = "block";
        }
    };

    closeModal.addEventListener("click", () => {
        stockModal.style.display = "none";
    });

    const addToPortfolioDOM = (stockName, quantity, price) => {
        const totalPrice = (quantity * price).toFixed(2);
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${stockName}</td>
            <td>${quantity}</td>
            <td>Rs ${price.toFixed(2)}</td>
            <td>Rs ${totalPrice}</td>
            <td><button class="remove-button" data-stock="${stockName}">Remove</button></td>
        `;
        portfolioList.appendChild(row);
    };

    portfolioForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const stockName = document.getElementById("stock-name").value.trim();
        const quantity = parseInt(document.getElementById("quantity").value.trim(), 10);
        const price = parseFloat(document.getElementById("price").value.trim());

        if (stockName && quantity > 0 && price > 0) {
            addToPortfolioDOM(stockName, quantity, price);
            portfolioForm.reset();

            fetch("http://localhost:8000/api/portfolio", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    stockName,
                    quantity,
                    price,
                }),
            }).catch((err) => console.error("Error saving stock:", err));
        } else {
            alert("Please fill out all fields with valid values.");
        }
    });

    searchButton.addEventListener("click", () => {
        const query = stockSearchInput.value.trim().toLowerCase();
        const filteredStocks = stockData.filter((stock) =>
            stock.name.toLowerCase().includes(query) || stock.symbol.toLowerCase().includes(query)
        );

        stockTableBody.innerHTML = "";
        filteredStocks.forEach((stock) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${stock.name}</td>
                <td>${stock.symbol}</td>
                <td>${stock.price}</td>
                <td>${stock.change}</td>
                <td><button class="details-button" data-symbol="${stock.symbol}">Details</button></td>
            `;
            stockTableBody.appendChild(row);
        });
    });

    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("details-button")) {
            const symbol = event.target.getAttribute("data-symbol");
            showStockDetails(symbol);
        } else if (event.target.classList.contains("remove-button")) {
            const stockName = event.target.getAttribute("data-stock");
            const row = event.target.closest("tr");
            row.remove();

            fetch("http://localhost:8000/api/portfolio", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ stockName }),
            })
                .then((res) => {
                    if (res.ok) {
                        console.log("Stock removed from portfolio");
                    } else {
                        console.error("Failed to remove stock");
                    }
                })
                .catch((err) => console.error("Error removing stock:", err));
        }
    });

    populateStockTable();
});

const contactForm = document.getElementById("contact-form");

contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
        alert("Please fill out all fields.");
        return;
    }

    fetch("http://localhost:8000/api/contact", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
    })
        .then((res) => {
            if (res.ok) {
                alert("Message sent successfully!");
                contactForm.reset();
            } else {
                alert("Failed to send message.");
            }
        })
        .catch((err) => {
            console.error("Contact error:", err);
            alert("An error occurred while sending the message.");
        });
});
