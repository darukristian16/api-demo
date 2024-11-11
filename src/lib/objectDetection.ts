export const detectObjectsAPI = async (image: File) => {
    const formData = new FormData()
    formData.append('file', image)
  
    const response = await fetch(process.env.NEXT_PUBLIC_OBJECT_DETECTION_URL + '/v1', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_OBJECT_DETECTION_API_KEY || '',
        'accept': 'application/json'
      },
      body: formData
    })
  
    return response.json()
  }
  