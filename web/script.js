document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.getElementById('add-button');
    const fetchButton = document.getElementById('fetch-button');

    addButton.addEventListener('click', addLink);
    fetchButton.addEventListener('click', fetchLinks);

    fetchLinks(); // Fetch links when the page loads

    function addLink() {
        const url = document.getElementById('link-input').value;

        fetch('/api/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add link');
            }
            document.getElementById('link-input').value = '';
            document.getElementById('add-error').textContent = '';
            fetchLinks();
        })
        .catch(error => {
            document.getElementById('add-error').textContent = error.message;
        });
    }

    function fetchLinks() {
        fetch('/api/fetch')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch links');
            }
            return response.json();
        })
        .then(data => {
            const linksList = document.getElementById('links-list');
            linksList.innerHTML = '';
            data.links.forEach(link => {
                const li = document.createElement('li');
                const anchor = document.createElement('a'); // Create anchor element
                anchor.textContent = link.url;
                anchor.href = link.url; // Set href attribute to the URL
                anchor.target = '_blank'; // Open link in a new tab
                li.appendChild(anchor); // Append anchor to list item
                linksList.appendChild(li);
            });
            document.getElementById('fetch-error').textContent = '';
        })
        .catch(error => {
            document.getElementById('fetch-error').textContent = error.message;
        });
    }
});
