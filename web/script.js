document.addEventListener("DOMContentLoaded", () => {
  const addButton = document.getElementById("add-button");
  const fetchButton = document.getElementById("fetch-button");

  addButton.addEventListener("click", addLink);
  fetchButton.addEventListener("click", fetchLinks);

  fetchLinks();
  fetchTotalLinks();

      // Function to animate count from 0 to the given number in a specific duration
      function animateCount(element, countTo, duration) {
        let start = 0;
        const increment = Math.ceil(countTo / (duration / 100)); // Increment calculation based on duration

        const timer = setInterval(() => {
            start += increment;
            element.textContent = `Total Links = ${start}`;
            if (start >= countTo) {
                clearInterval(timer);
                element.textContent = `Total Links = ${countTo}`;
            }
        }, 100);
    }

    function fetchTotalLinks() {
        fetch('/api/total')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch total links');
            }
            return response.json();
        })
        .then(data => {
            const totalLinksElement = document.getElementById('total-links');
            const countTo = data.totalLinks;
            const duration = 3000; // 3 seconds

            animateCount(totalLinksElement, countTo, duration);
        })
        .catch(error => {
            console.error('Error fetching total links:', error);
        });
    }

  function truncateText(text, maxLength) {
    if (text.length > maxLength) {
      return text.substring(0, maxLength - 3) + "..."; // Truncate and add ...
    }
    return text;
  }

  function renderLinks(links) {
    const linksList = document.getElementById("links-list");
    linksList.innerHTML = "";
    links.forEach((link) => {
      const li = document.createElement("li");
      const anchor = document.createElement("a");
      anchor.textContent = truncateText(link.url, 70); // Truncate to 50 characters
      anchor.href = link.url;
      anchor.target = "_blank";
      li.appendChild(anchor);
      linksList.appendChild(li);
    });
    document.getElementById("fetch-error").textContent = "";
  }

  let linksAdded = 0; // Variable to track the number of links added

  function addLink() {
    const url = document.getElementById("link-input").value;

    fetch("/api/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add link");
        }
        document.getElementById("link-input").value = "";

        // Increment the number of links added
        linksAdded++;

        // Display success message with the number of links added
        const successMessage = document.createElement("p");
        successMessage.textContent = `Added ${
          linksAdded > 1 ? `x${linksAdded}` : "successfully"
        }`;
        successMessage.classList.add("success"); // Add a class for styling

        // Check if success message already exists, replace it if so
        const existingSuccessMessage = document.querySelector(".success");
        if (existingSuccessMessage) {
          existingSuccessMessage.replaceWith(successMessage);
        } else {
          document.getElementById("add-link").appendChild(successMessage);
        }

        // Clear error and fetch updated links
        document.getElementById("add-error").textContent = "";
        document.getElementById("fetch-error").textContent = "";
        fetchLinks();
      })
      .catch((error) => {
        document.getElementById("add-error").textContent = error.message;
      });
  }

  function fetchLinks() {
    fetch("/api/fetch")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch links");
        }
        return response.json();
      })
      .then((data) => {
        renderLinks(data.links);
      })
      .catch((error) => {
        document.getElementById("fetch-error").textContent = error.message;
      });
  }
});
