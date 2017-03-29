const isProduction = location.host === 'www.petasitcheff.com' ? true : false;
const environment = isProduction ? 'production' : 'staging';

// Where we store contact form details
let userData = {};

// Fire page view to Google Analytics
if (ga) {
  ga('create', 'UA-34474019-10', 'auto');
  ga('set', {
    dimension1: environment
  });
  ga('send', 'pageview');
}

// The AJAX request to Formspree
function formSpree(data) {
  var deferred = $.Deferred();
  $.ajax({
    url: 'https://formspree.io/jw@nabu.io',
    method: 'POST',
    data: data,
    dataType: 'json'
  }).done(function(data) {
    deferred.resolve('success');
    console.log('AJAX success', data);
  }).fail(function(jqXHR, textStatus, errorThrown) {
    deferred.reject('fail');
    console.error('AJAX fail', jqXHR, textStatus, errorThrown);
  });
  return deferred.promise();
}

function submitContactForm() {
  const label = !isProduction ? '[TEST] ' : '';
  const extra = !isProduction ? 'Given that this is test data, it\'s very likely Jan or Hannah working on your website :)' : '';
  let data = {
    message: `${label} Someone just completed the contact form on ${location.href}. ${extra}`,
    _subject: `${label} Someone is contacting you`,
    _format: 'plain'
  };
  const keys = ['name', 'email', 'phone', 'location', 'company', 'industry', 'message'];
  $.each(keys, function(i, key) {
    data[key] = userData[key] || '-';
  });
  console.log('Submitting contact form to FormSpree ...', data);
  const $btn = $('#contact #form button');
  $btn.html('Sending...').prop('disabled', true);
  $.when(formSpree(data)).then(function() {
    console.log('success');
    $btn.html('Sent!');
  }, function() {
    console.log('fail');
    $btn.html('Whoops, invalid email?').prop('disabled', false).hover(function() {
      $(this).html('Try again');
    }, function() {
      $(this).html('Whoops, invalid email?');
    });
  });
}

// Store key value pairs in sessionStorage
function store(key, value) {
  userData[key] = value;
  console.log(key, value);
}

$(document).ready(function() {

  // TODO: Replace with Nunjucks
  $('body').addClass(environment);

  // Make any hashtag link scroll with animation to element with matching ID
  // Example: <a href="#features"> will scroll to element with ID #features
  $('a[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 1000);
        return false;
      }
    }
  });

  // Submit contact form details to FormSpree
  $('#contact #form button').on('click', function() {
    submitContactForm();
  });

  // Observe all inputs and textareas for user interactions, store data as users type
  $(document).on('keyup blur change', 'input, textarea', function() {
    const key = $(this).attr('name');
    const value = $(this).val();
    if (key && value) {
      store(key, value);
      $(this).addClass('has-value');
    } else {
      $(this).removeClass('has-value');
    }
  });

});
