export async function processOCRDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  // Determine endpoint based on file type
  const endpoint = file.type.includes('pdf') ? '/ocr/bbox/pdf' : '/ocr/bbox/image';
  const apiUrl = `${process.env.NEXT_PUBLIC_OCR_URL}${endpoint}`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'x-api-key': process.env.NEXT_PUBLIC_OCR_API_KEY || '',
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`OCR API responded with status: ${response.status}`);
  }

  return response.json();
}