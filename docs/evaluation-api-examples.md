# Evaluation API Examples

## Upload Evaluation Template

The following example shows how to upload an Excel template file using curl:

```bash
curl -X POST http://localhost:3000/evaluation/upload-template \
  -F "file=@/path/to/your/template.xlsx" \
  -F "sessionID=12345"
```

### Supported File Types:

- Excel files (.xlsx): `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Excel files (.xls): `application/vnd.ms-excel`
- CSV files (.csv): `text/csv`

### Parameters:

- `file`: The Excel file to upload (max 5MB)
- `sessionID`: A numeric identifier for the session

### Response:

```json
{
  "success": true,
  "sessionID": 12345,
  "filename": "template.xlsx",
  "message": "Evaluation template uploaded and cached successfully"
}
```

### Troubleshooting File Uploads

If you're getting file type validation errors, ensure your Excel file is properly formatted. You can also check the actual MIME type of your file using:

```bash
# On Linux/Mac
file --mime-type /path/to/your/template.xlsx

# Alternatively, use curl to test with verbose output
curl -v -X POST http://localhost:3000/evaluation/upload-template \
  -F "file=@/path/to/your/template.xlsx" \
  -F "sessionID=12345"
```

## Frontend Implementation Example

Here's how you can implement the file upload in a frontend application:

### HTML Form Example:

```html
<form id="uploadForm">
  <input type="number" name="sessionID" placeholder="Session ID" required>
  <input type="file" name="file" accept=".xlsx,.xls,.csv" required>
  <button type="submit">Upload Template</button>
</form>
```

### JavaScript Example:

```javascript
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  const sessionID = document.querySelector('input[name="sessionID"]').value;
  const file = document.querySelector('input[name="file"]').files[0];
  
  formData.append('sessionID', sessionID);
  formData.append('file', file);
  
  try {
    const response = await fetch('http://localhost:3000/evaluation/upload-template', {
      method: 'POST',
      body: formData,
      // No need to set Content-Type header, it will be set automatically with boundary
    });
    
    const result = await response.json();
    console.log('Success:', result);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
});
```

### React Example:

```jsx
import { useState } from 'react';

function TemplateUploader() {
  const [sessionID, setSessionID] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append('sessionID', sessionID);
    formData.append('file', file);
    
    try {
      const response = await fetch('http://localhost:3000/evaluation/upload-template', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error uploading file:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h2>Upload Evaluation Template</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Session ID:
            <input 
              type="number" 
              value={sessionID} 
              onChange={(e) => setSessionID(e.target.value)} 
              required 
            />
          </label>
        </div>
        <div>
          <label>
            Template File:
            <input 
              type="file" 
              accept=".xlsx,.xls,.csv" 
              onChange={(e) => setFile(e.target.files[0])} 
              required 
            />
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Template'}
        </button>
      </form>
      
      {result && (
        <div>
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default TemplateUploader; 