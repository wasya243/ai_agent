export async function requestExtractIntent(peyload: { text: string }) {
  const response = await fetch('http://localhost:3000/api/extract-intent', {
    method: 'POST',
    body: JSON.stringify(peyload),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.clone().json();

  return { ...response, data };
}
