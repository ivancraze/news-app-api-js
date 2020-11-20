// http module
function customHttp() {
    return {
      get(url, callback) {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', url);
          xhr.addEventListener('load', () => {
            if (Math.floor(xhr.status / 100) !== 2) {
              callback(`Error. Status code: ${xhr.status}`, xhr);
              return;
            }
            const response = JSON.parse(xhr.responseText);
            callback(null, response);
          });
  
          xhr.addEventListener('error', () => {
            callback(`Error. Status code: ${xhr.status}`, xhr);
          });
  
          xhr.send();
        } catch (error) {
          callback(error);
        }
      },
      post(url, body, headers, callback) {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', url);
          xhr.addEventListener('load', () => {
            if (Math.floor(xhr.status / 100) !== 2) {
              callback(`Error. Status code: ${xhr.status}`, xhr);
              return;
            }
            const response = JSON.parse(xhr.responseText);
            callback(null, response);
          });
  
          xhr.addEventListener('error', () => {
            callback(`Error. Status code: ${xhr.status}`, xhr);
          });
  
          if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
              xhr.setRequestHeader(key, value);
            });
          }
  
          xhr.send(JSON.stringify(body));
        } catch (error) {
          callback(error);
        }
      },
    };
  }

// load http module
const http = customHttp();

const newsService = (function() {
  const apiKey = '02a25462f30d44e98f83f5f9d4a6eaa8';
  const apiUrl = 'https://newsapi.org/v2';

  return {
    topHeadlines(country = 'ru', callback) {
      http.get(`${apiUrl}/top-headlines?country=${country}&category=technology&apiKey=${apiKey}`, callback);
    },
    everything(query, callback) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, callback);
    }
  }
})();

// elements
const form = document.forms['newsControls'];
const countrySelector = form.elements['country'];
const searchInput = form.elements['search'];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  loadNews();
})

//  load materialize, func
document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();
  loadNews();
});

// function load news 
function loadNews() {
  showPreloader();
  const country = countrySelector.value;
  const searchText = searchInput.value;

  if (!searchText) {
    newsService.topHeadlines(country, onGetResponce);
  } else {
    newsService.everything(searchText, onGetResponce);
  }
}

// function get response from server
function onGetResponce(err, res) {
  hidePreloader();
  if (err) {
    showAlert(err, 'error-msg');
    return;
  }
  if (!res.articles.length) {
    //show empty message
    showAlert('введи нормально блять', 'success');
    return;
  }
  renderNews(res.articles);
}

// function alert
function showAlert(message, type = 'success') {
  M.toast({ html: message, classes: type });
}

//functions show/hide preloader
function showPreloader() {
  const preloader = `
    <div class='center preloader'>
      <div class="preloader-wrapper small active">
        <div class="spinner-layer spinner-blue-only">
          <div class="circle-clipper left">
            <div class="circle"></div>
          </div><div class="gap-patch">
            <div class="circle"></div>
          </div><div class="circle-clipper right">
            <div class="circle"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.querySelector('.search-controls').insertAdjacentHTML('afterend', preloader);
}
function hidePreloader() {
  const loader = document.querySelector('.preloader');
  if (loader) {
    loader.remove();
  }
}


// function render news
function renderNews(news) {
  const newsContainer = document.querySelector('.news-container .row');
  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }
  let fragment ='';

  news.forEach(newsItem => {
    const elem = newsTemplate(newsItem);
    fragment += elem;
  });

  newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

// function clear container
function clearContainer(container) {
  container.innerHTML = '';
  // let child = container.lastElementChild;
  // while (child) {
  //   container.removeChild(child);
  //   container = container.lastElementChild;
  // }
}

// news item template function
function newsTemplate({ urlToImage, title, url, description }) {
  return `
    <div class='col s12'>
      <div class='card'>
        <div class='card-image'>
          <img src='${urlToImage}'>
          <span class=card-title>${title || ''}</span>
        </div>
        <div class='card-content'>
          <p>${description || ''}</p>
        </div>
        <div class='card-action'>
          <a href='${url}'>Read more</a>
        </div>
      </div>
    </div>
  `;
}