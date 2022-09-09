
let films = [];
let weeks = new Array(52);
weeks.fill(0);

function begin(){
    //document.getElementById('inputTable').style.display = "none";
    //document.getElementById('mainTable').style.display = "";
    getDiary();
}

function request(options) {
    return new Promise((resolve, reject) => {
        options.onload = res => resolve(res);
        options.onerror = err => reject(err);
        options.ontimeout = err => reject(err);
        GM_xmlhttpRequest(options); // eslint-disable-line new-cap
    });
}

async function getDataFromURL(link) {
    try {
        const res = await request({
            url: link,
            method: 'GET'
        });
        return {response: res.response, url: res.responseURL};
    } catch (err) {
        console.error(err);
    }
    return null;
}

function parseHTML(html){
    var parser = new DOMParser();
    return parser.parseFromString(html, "text/html");
}

function getDiary(){
    var username = document.getElementById("username").value;
    username = "joelhaver";
    var url = 'https://letterboxd.com/' + username + '/films/diary/for/2022/'
    
    getDataFromURL(url).then((value) => {
        var response = parseHTML(value.response);
        var entries = response.querySelectorAll('.diary-entry-row');

        entries.forEach(entry => {
            var film = {};
            // Film title and url
            var film_details = entry.querySelector('.td-film-details .headline-3 a');
            film.title = film_details.innerText;
            film.url = film_details.getAttribute('href');
            film.url = film.url.replace(username + '/','');

            // Watch date
            var diary_day = entry.querySelector('.td-day.diary-day a').getAttribute('href');
            diary_day = diary_day.match(/\/for\/([0-9]{4})\/([0-9]{2})\/([0-9]{2})\/$/);
            film.year = diary_day[1];
            film.month = diary_day[2];
            film.day = diary_day[3];
            film.date = film.year + '-' + film.month + '-' + film.day;

            // Week
            var startDate = new Date(film.year);
            //var startDate = new Date("2021-12-31");
            startDate = new Date(startDate.getTime() - (1000 * 60 * 60 * 24));
            var filmDate = new Date(film.date);
            var timespan = filmDate.getTime() - startDate.getTime();
            film.week = timespan / (1000 * 3600 * 24 * 7);
            film.week = Math.ceil(film.week);

            weeks[film.week-1]++;

            // Rating
            var rating = entry.querySelector('.td-rating .hide-for-owner .rating');
            if (rating != null){
                film.rating = rating.getAttribute('class');
                film.rating = film.rating.replace('rating rated-','');
            }

            films.push(film);
        });

        var temp = '';
    });
}

//document.getElementById('mainTable').style.display = "none";
