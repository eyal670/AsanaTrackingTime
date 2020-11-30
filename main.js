var myHeaders = {
    "Authorization": "Basic ZXlhbEBkaXZpbmVzaXRlcy5jby5pbDppMTlhYmQ1bDh0ZzFja2lkaXRiZDg3Z3NpaQ==",
    "Cookie": "__cfduid=dffbdff70157a7f9f5341eb162c5b2e2d1606730253; AWSELB=6D6FCB2F12794CF86F4D94458D62AA2CC77F540C607C6CE95F5BF4C1FF2BBCC268111BEA13BF3CE18D9E0263A3A6D98352779ABA9D43971CEED81D5733E6711B1760CF1C07"
  }
console.log('Asana Extention');
// chrome.pageAction.show(1);
//options vars
var version = '0.1.2';

//loading the script
jQuery(document).ready(function () {
  console.log('doc ready');
  setTimeout(function () {
    ttGetData();
  }, 1500);
});

function searchProject(project) {
  project = project.replace(/\s/g,' ');
  var query = 'https://app.trackingtime.co/api/v4/projects/search?keyword=' + project + '&type=PROJECT';
  var a = jQuery.ajax({
    url: query,
    dataType: 'json',
    type: 'GET',
    headers: myHeaders,
    "permissions": [
      "https://divine.bitrix24.com/company/personal/user/6/tasks/"
    ]
  }).done(function (r) {
    var data = a.responseJSON.data;
    if (data.length >= 1) {
      console.log('if' + a.responseJSON.data);
      var id = a.responseJSON.data[0].id;
      getHours(id);
    }else{
      console.log('no such project');
    }
  });
}

function getHours(projectId) {
  if (projectId) {
    query = 'https://app.trackingtime.co/api/v4/projects/' + projectId;
    var b = jQuery.ajax({
      url: query,
      dataType: 'json',
      type: 'GET',
      headers: myHeaders,
      "permissions": [
        "https://divine.bitrix24.com/company/personal/user/6/tasks/"
      ]
    }).done(function () {
      var time = b.responseJSON.data.estimated_time;
      var worked = b.responseJSON.data.worked_hours;
      var balance = time - worked;
      var overtime;
      var ttlink = 'https://pro.trackingtime.co/#/project/' + projectId;
      var link = 'https://docs.google.com/spreadsheets/d/19svrDgl0xCKDD1Bz-hjy1Em1o1dVqLwYVg8YBe97vAg/edit#gid=0';
      var json = b.responseJSON.data.json;
      if (json) {
        var table = JSON.parse(json).sheet;
        if (table) {
          link = table;
        }
      }
      balance = balance.toFixed(2);
      console.log(balance);
      console.log(time);
      if (time == 0) {
        console.log('unknown');
        var overtime = 'unknown';
      } else {
        var overtime = balance + 'hr';
      }
      var colorClass = 'zero';
      var msg = '<span class="title">last updated balance: </span>' + balance + 'hr';
      if (balance > 0) {
        colorClass = 'good';
      } else if (balance < 0) {
        colorClass = 'bad';
        msg = '<span class="title">last updated balance: </span> Over Time (' + overtime + ')';
      }
      jQuery('.TopbarPageHeaderStructure-titleRow').append('<p class="ttH ' + colorClass + '"><a title="open project\'s table" href="' + link + '" target="_blank">' + msg + '</a><span class="tth_seperator"> | </span><a title="open project in TrackingTime" href="' + ttlink + '" target="_blank">tt</></p>');
    });
  } else {
    jQuery('.TopbarPageHeaderStructure-titleRow').append('<p class="ttH bad"><a title="open TrackingTime" href="https://pro.trackingtime.co" target="_blank">project not found</a></p>');
  }
}

function ttGetData() {
  window.triggered = false;
  jQuery(".AsanaPageTopbar").unbind();
  var project = jQuery('.ProjectPageHeader .TopbarPageHeaderStructure-title').text();
  console.log('p: ' + jQuery('.TopbarPageHeaderStructure-title').text());
  if (project) {
    project = project.trim();
    console.log(project);
    console.log('making request');
    searchProject(project);
  } else {
    //do nothing
    console.log('not a project');
  }
  jQuery(".AsanaPageTopbar").on('DOMSubtreeModified', function (e) {
    if (window.triggered != true) {
      if (!jQuery('.ttH').length) {
        console.log('project changed');
        setTimeout(ttGetData, 1500);
        window.triggered = true;
      }
    } else {
      console.log('skip: ' + window.triggered);
    }
  });
}