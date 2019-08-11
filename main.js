console.log('Asana Extention');
// chrome.pageAction.show(1);
//options vars
var version = '0.1';

//loading the script
jQuery(document).ready(function () {
  console.log('doc ready');
  ttGetData();
});

function searchProject(project) {
  var query = 'https://app.trackingtime.co/api/v4/projects/search?keyword=' + project + '&type=PROJECT';
  var a = jQuery.ajax({
    url: query,
    dataType: 'json',
    async: false,
    type: 'GET',
    "permissions": [
      "https://divine.bitrix24.com/company/personal/user/6/tasks/"
    ],
    callback: function (r) {
      return r;
    }
  });
  var data = a.responseJSON.data;
  if (data.length >= 1) {
    console.log('if' + a.responseJSON.data);
    var id = a.responseJSON.data[0].id;
    return id;
  }
}

function getHours(projectId) {
  if (projectId) {
    query = 'https://app.trackingtime.co/api/v4/projects/' + projectId;
    var a = jQuery.ajax({
      url: query,
      dataType: 'json',
      async: false,
      type: 'GET',
      "permissions": [
        "https://divine.bitrix24.com/company/personal/user/6/tasks/"
      ],
      callback: function (r) {
        return r;
      }
    });
    var time = a.responseJSON.data.estimated_time;
    var worked = a.responseJSON.data.worked_hours;
    var balance = time - worked;
    var overtime;
    var ttlink = 'https://pro.trackingtime.co/#/project/' + projectId;
    var link = 'https://docs.google.com/spreadsheets/d/19svrDgl0xCKDD1Bz-hjy1Em1o1dVqLwYVg8YBe97vAg/edit#gid=0';
    var json = a.responseJSON.data.json;
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
  } else {
    jQuery('.TopbarPageHeaderStructure-titleRow').append('<p class="ttH bad"><a title="open TrackingTime" href="https://pro.trackingtime.co" target="_blank">project not found</a></p>');
  }
}

function ttGetData() {
  var project = jQuery('.ProjectPageHeader-projectName').attr('title');
  if (project) {
    project = project.trim();
    console.log(project);
    console.log('making request');
    var pid = searchProject(project);
    getHours(pid);
  } else {
    //do nothing
    console.log('not a project');
  }
  jQuery(".pageTopbarView-pageHeader").on('DOMSubtreeModified', function () {
    if (!jQuery('.ttH').length) {
      console.log('project changed');
      setTimeout(ttGetData, 1500);
    }
  });
}