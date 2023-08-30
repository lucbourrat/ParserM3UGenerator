document.addEventListener('DOMContentLoaded', () => {
    const m3uFileInput = document.getElementById('m3uFileInput');
    const parseButton = document.getElementById('parseButton');
    const preselectButton = document.getElementById('preselectButton');
    const groupTitlesList = document.getElementById('groupTitlesList');
    const generateAndDownloadButton = document.getElementById('generateAndDownloadButton');

    let m3uContent = '';

    parseButton.addEventListener('click', () => {
        const file = m3uFileInput.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = function(event) {
                m3uContent = event.target.result;
                const groupTitles = getUniqueGroupTitles(m3uContent);
                displayGroupTitles(groupTitles);
            };

            reader.readAsText(file);
        }
    });

    preselectButton.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach(checkbox => {
            const title = checkbox.value;
            if (title.startsWith('|FR|') || title.startsWith('FR|') || title.endsWith('|FR') || title.includes('FR FRANCE')) {
                checkbox.checked = true;
            }
        });
    });

    generateAndDownloadButton.addEventListener('click', () => {
        const checkedTitles = [];
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');

        checkboxes.forEach(checkbox => {
            checkedTitles.push(checkbox.value);
        });

        const newM3UContent = generateNewM3UContent(m3uContent, checkedTitles);
        downloadM3UFile(newM3UContent);
    });

    function getUniqueGroupTitles(m3uContent) {
        const m3uLines = m3uContent.split('\n');
        const groupTitlesSet = new Set();

        for (let i = 1; i < m3uLines.length; i += 2) {
            const line = m3uLines[i];
            const match = line.match(/group-title="([^"]+)"/);
            if (match) {
                const groupTitle = match[1];
                groupTitlesSet.add(groupTitle);
            }
        }

        const sortedGroupTitles = Array.from(groupTitlesSet).sort(); // Tri des groupes
        return sortedGroupTitles;
    }

    function displayGroupTitles(groupTitles) {
        groupTitlesList.innerHTML = '';

        groupTitles.forEach(title => {
            const listItem = document.createElement('li');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = title;
            listItem.appendChild(checkbox);

            const label = document.createElement('label');
            label.textContent = title;
            listItem.appendChild(label);

            groupTitlesList.appendChild(listItem);
        });
    }

    function generateNewM3UContent(originalContent, titles) {
        const originalLines = originalContent.split('\n');
        let newContent = '';
        let includeChannel = false;
    
        newContent += originalLines[0] + '\n'; // Ajoute la première ligne "#EXTM3U"

        for (let i = 1; i < originalLines.length; i=i+2) {
            if (includeChannel) {
                includeChannel = false;
            }
    
            if ((i - 1) % 2 === 0 && titles.includes(getGroupTitle(originalLines[i]))) {
                includeChannel = true;
                newContent += originalLines[i] + '\n';
                newContent += originalLines[i + 1] + '\n';
            }
        }
    
        return newContent;
    }

    function getGroupTitle(line) {
        const match = line.match(/group-title="([^"]+)"/);
        if (match) {
            return match[1];
        }
        return '';
    }

    function downloadM3UFile(content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'selected_channels.m3u';
        a.textContent = 'Download M3U';

        a.style.display = 'none';
        document.body.appendChild(a);

        a.click();

        a.addEventListener('click', () => {
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 0);
        });
    }
});
