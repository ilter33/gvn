export const searchEngines = {
  github: 'https://api.github.com/search/code?q='
};

export async function search(dork, engine) {
  try {
    const response = await fetch(`${searchEngines[engine]}${encodeURIComponent(dork)}+in:file&per_page=10`, {
      headers: {
        'Authorization': 'token YOUR_GITHUB_TOKEN', // GitHub Token ekleyin
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    const data = await response.json();
    return data.items.map(item => item.html_url);
  } catch (error) {
    throw new Error('GitHub API hatası: ' + error.message);
  }
}