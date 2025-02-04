const csvHeaders = [
  "source",
  "batches",
  "type",
  "text",
  "choices",
  "correct_choice",
  "original_question",
  "original_answer",
  "discipline",
  "instructor",
  "matching_index",
  "lecture",
  "index",
  "feedback_text",
  "feedback_images",
  "attachments",
  "week"
];

// Helper function to convert JSON data to CSV using the fixed header order.
function convertToCSV(objArray) {
  if (!objArray || objArray.length === 0) {
    return "";
  }
  
  const csvRows = [];
  
  // Add header row.
  csvRows.push(csvHeaders.join(','));

  // Add data rows.
  for (const row of objArray) {
    const values = csvHeaders.map(header => {
      let val = row[header];
      if (val === undefined || val === null) {
        val = "";
      } else if (typeof val === 'string') {
        // Escape double quotes.
        val = val.replace(/"/g, '""');
        // Wrap in quotes if needed.
        if (val.search(/("|,|\n)/g) >= 0) {
          val = `"${val}"`;
        }
      }
      return val;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

// Function to download data as a CSV file.
function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Function to load stored data and display it.
function loadOutput() {
  chrome.storage.local.get(['storedData'], (result) => {
    const outputDiv = document.getElementById("output");
    if (result.storedData && result.storedData.length > 0) {
      outputDiv.textContent = JSON.stringify(result.storedData, null, 2);
    } else {
      outputDiv.textContent = "No data found.";
    }
  });
}

// Load data when the page opens.
loadOutput();

// Clear Data button: remove storedData from storage.
document.getElementById('clear').addEventListener('click', () => {
  if (confirm("Are you sure you want to clear all stored data? This action will permanently remove the previous outputs.")) {
    chrome.storage.local.remove(['storedData'], () => {
      document.getElementById("output").textContent = "No data found.";
    });
  }
});

// Save Changes button: update storedData with the edited output.
document.getElementById('save').addEventListener('click', () => {
  const outputDiv = document.getElementById("output");
  try {
    // Parse the content as JSON.
    const newData = JSON.parse(outputDiv.innerText);
    chrome.storage.local.set({ storedData: newData }, () => {
      alert("Data updated successfully!");
    });
  } catch(e) {
    alert("Invalid JSON. Please fix the errors before saving.");
  }
});

// Download CSV button: Convert stored JSON data to CSV and download.
document.getElementById('download').addEventListener('click', () => {
  chrome.storage.local.get(['storedData'], (result) => {
    if (result.storedData && result.storedData.length > 0) {
      const csv = convertToCSV(result.storedData);
      downloadCSV(csv, 'doc_parser_output.csv');
    } else {
      alert("No data available to download.");
    }
  });
});
