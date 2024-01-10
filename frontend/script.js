// Script by chatgpt cuz i dont like to write js code :)

document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const addButton = document.getElementById("add-button");
  const fetchButton = document.getElementById("fetch-button");
  const linksList = document.getElementById("links-list");
  const totalLinksElement = document.getElementById("total-links");
  const linkInput = document.getElementById("link-input");
  const addError = document.getElementById("add-error");
  const fetchError = document.getElementById("fetch-error");

  let linksAdded = 0;

  // Event listeners
  addButton.addEventListener("click", addLink);
  fetchButton.addEventListener("click", fetchLinks);

  // Initialization
  fetchLinks();
  fetchTotalLinks();

  // Animation for total links count
  function animateCount(element, countTo, duration) {
    let start = 0;
    const increment = Math.ceil(countTo / (duration / 100));

    const timer = setInterval(() => {
      start += increment;
      element.textContent = `Total Links = ${start}`;
      if (start >= countTo) {
        clearInterval(timer);
        element.textContent = `Total Links = ${countTo}`;
      }
    }, 100);
  }

  // Fetch total links count
  function fetchTotalLinks() {
    fetch('/api/total')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch total links');
        }
        return response.json();
      })
      .then(data => {
        const countTo = data.totalLinks;
        const duration = 3000;

        animateCount(totalLinksElement, countTo, duration);
      })
      .catch(error => {
        console.error('Error fetching total links:', error);
      });
  }

  // Utility function to truncate text
  function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength - 3) + "..." : text;
  }

  // Rendering links
  function renderLinks(links) {
    linksList.innerHTML = "";
    links.forEach((link) => {
      const li = document.createElement("li");
      const anchor = document.createElement("a");
      anchor.textContent = truncateText(link.url, 70);
      anchor.href = link.url;
      anchor.target = "_blank";
      li.appendChild(anchor);
      linksList.appendChild(li);
    });
    fetchError.textContent = "";
  }

  // Add link function
  function addLink() {
    const url = linkInput.value;

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
        linkInput.value = "";
        linksAdded++;

        const successMessage = document.createElement("p");
        successMessage.textContent = `Added ${linksAdded > 1 ? `x${linksAdded}` : "successfully"}`;
        successMessage.classList.add("success");

        const existingSuccessMessage = document.querySelector(".success");
        if (existingSuccessMessage) {
          existingSuccessMessage.replaceWith(successMessage);
        } else {
          document.getElementById("add-link").appendChild(successMessage);
        }

        addError.textContent = "";
        fetchError.textContent = "";
        fetchLinks();
      })
      .catch((error) => {
        addError.textContent = error.message;
      });
  }

  // Fetch links function
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
        fetchError.textContent = error.message;
      });
  }
});
