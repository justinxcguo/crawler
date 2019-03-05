const cheerio = require('cheerio');
const fetch = require("node-fetch");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: './FCA_Wealth.csv',
    header: [
        {id: 'company', title: 'Company Name'},
        {id: 'address', title: 'Address'},
        {id: 'phone', title: 'Phone'},
        {id: 'website', title: 'Website'}
    ]
});

//const SEARCH_LINK = "https://register.fca.org.uk/shpo_searchresultspage?CMC%7CFSF%7CAUF=1&FSF=1&search=Partner&TOKEN=3wq1nht7eg7tr";
//const SEARCH_LINK = "https://register.fca.org.uk/shpo_searchresultspage?CMC%7CFSF%7CAUF=1&FSF=1&search=Manager&TOKEN=3wq1nht7eg7tr";
//const SEARCH_LINK = "https://register.fca.org.uk/shpo_searchresultspage?CMC%7CFSF%7CAUF=1&FSF=1&search=Investment&TOKEN=3wq1nht7eg7tr";
//const SEARCH_LINK = "https://register.fca.org.uk/shpo_searchresultspage?CMC%7CFSF%7CAUF=1&FSF=1&search=Advic&TOKEN=3wq1nht7eg7tr";
const SEARCH_LINK = "https://register.fca.org.uk/shpo_searchresultspage?CMC%7CFSF%7CAUF=1&FSF=1&search=wealth&TOKEN=3wq1nht7eg7tr";
//const SEARCH_LINK = "https://register.fca.org.uk/shpo_searchresultspage?CMC%7CFSF%7CAUF=1&FSF=1&search=Advis&TOKEN=3wq1nht7eg7tr"

const fillRecords = async () => {
    const links = [];
    fetch(SEARCH_LINK)
     .then(response => {
        return response.text();
    })
    .then(html => {
        let $ = cheerio.load(html);
        $('tbody > tr').has('.ResultName').each(function(i, elem){
            let link = $(elem).find('td > a').attr('href');
            links.push(link);
            //fs.appendFileSync('output.txt', link + '\n');
        })
        return Promise.all(links);
    })
    .then(async (links) => {
        console.log("total companies:" + links.length);
        for (let i = 0; i < links.length; i++) {
            const response = await fetch(links[i]);
            const html = await response.text();
            let $ = cheerio.load(html);
            let company = $('.RecordDetails > .RecordName').text() || '';
            let address = '', phone = '', email = '', website = '';
            $('#ShPo_PrincipleBusinessAddressTable').find('.addressline').each((i, elem) => {
                const addressLine = $(elem).text().trim();
                address = address + addressLine + ' ' ;
            })
            //console.log(address);
            $('#ShPo_PrincipleBusinessAddressTable').find('.addresssection').each((i,elem) => {
                const label = $(elem).find('.addresslabel').text();
                if (label.includes('Phone')) {
                    phone = $(elem).find('.addressvalue').text();
                    //console.log(phone);
                } else if (label.includes('Email')) {
                    email = $(elem).find('.addressvalue').text();
                    //console.log(email);
                } else if (label.includes('Website')) {
                    website = $(elem).find('.addressvalue').text();
                    //console.log(website);
                }
            })
            //let text =  company + ' ' + address + ' ' + phone + ' ' + email + ' ' + website + '\n';
            //fs.appendFileSync('detail.txt', text); 
            const record = [{
                company,
                address,
                phone,
                website
            }]
            await csvWriter.writeRecords(record);
        }
    })
    .catch((error) => {
        console.log(error);
    })
}

fillRecords();




