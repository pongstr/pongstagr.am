/*!
 * jQuery Pongstagr.am Plugin 
 * Copyright (c) 2013 Pongstr Ordillo
 * Version: 2.0.5
 * Code license under Apache License v2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 * Requires: jQuery v1.9 and Bootstrap JS
 */

;(function ($, window, document, undefined){
  
  "use strict";
  
  function renderHTML( targetElement, request, pager ){
    var galleryList      = '<ul class="thumbnails"></ul>',
        galleryContainer = '<div class="row-fluid">' + galleryList + '</div>',
        paginateBtn      = '<div class="row-fluid"><a href="javascript:void(0);" data-paginate="'+ request +'-pages" class="span4 offset4 btn btn-large btn-block btn-success">Load More</a></div>';

    $( targetElement ).append( galleryContainer ); 
    
    if ( pager === null || pager === true ){
      $( targetElement ).after( paginateBtn );
    }
      
  }
  
  function renderModal( imageOwner, imageId, imageTitle, imageUrl, imgUser, comments ){

    var modal  = '<div id="' + imageId + '" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">';
        modal += '<div class="modal-header">';
        modal += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>';
        modal += '<div class="row-fluid">';
        modal += '<div class="span1"><img src="' + imgUser + '" alt="" class="img-polaroid" style="width: 32px; height: 32px; margin-right: 10px; vertical-align: middle;" /></div>';
        modal += '<div class="span10"><strong><a href="http://www.instagram.com/' + imageOwner + '">' + imageOwner + '</a>&nbsp;' + imageTitle + '</strong></div>';
        modal += '</div><!-- end of .row-fluid -->';
        modal += '</div><!-- end of .modal-header -->';
        modal += '<div class="modal-body">';
        modal += '<div class="row-fluid">';
    
    if ( comments !== 0 ) {
        modal += '<div class="span7"><img src="' + imageUrl +'" alt="' + imageTitle + '" class="img-polaroid" /><br /></div>';
        modal += '<div class="modal-comments span5"></div>';
      } else {
        modal += '<img src="' + imageUrl +'" alt="' + imageTitle + '" class="img-polaroid" />';
    }
        modal += '</div><!-- end of .modal-fluid -->';
        modal += '</div><!-- end of .modal-body -->';
        modal += '<div class="modal-footer">';
        modal += '<button class="btn btn-inverse btn-mini" data-dismiss="modal" aria-hidden="true">Close</button>';
        modal += '</div><!-- end of .modal-footer -->';
        modal += '</div><!-- end of .modal -->';
                
    $('body').append( modal ); //*! Append modal window to body 
    
    $('#' + imageId ).on('hidden', function(){
      $(this).remove();
      $('body').removeAttr('style');
    });
    
  }

  function ajaxRequest( endpoint ){
    $.ajax({
      method   : "GET"    ,
      url      : endpoint ,
      cache    : true     ,
      dataType : "jsonp"  ,
      success  : function(data){
        
        $.each( data.data, function( key, value ){

          var thumbnail  = value.images.low_resolution.url, 
              imgCaption = ( value.caption !== null ) ? ( value.caption.text !== null ) ? value.caption.text : '' : value.user.username,
              comments   = ( value.comments.count !== null ) ? value.comments.count : '0',
              likes      = ( value.likes.count !== null ) ? value.comments.count : '0',
              imageUrl   = value.images.standard_resolution.url,
              imageId    = value.id,
              imgUser    = value.user.profile_picture,
              imageOwner = value.user.username;
                            
          var thumbBlock  = '<li class="span3">';
              thumbBlock += '<div class="thumbnail">';
              thumbBlock += '<a href="#" class="btn btn-mini btn-info btn-likes"><i class="icon-heart icon-white"></i> &nbsp;' + likes + '</a>';
              thumbBlock += '<a href="#" class="btn btn-mini btn-info btn-comments"><i class="icon-comment icon-white"></i> &nbsp;' + comments + '</a>';
              thumbBlock += '<a href="#" role="button" data-toggle="modal" data-reveal-id="' + imageId + '"><img src="' + thumbnail + '" alt="' + imgCaption + '" /></a>';
              thumbBlock += '</div>';
              thumbBlock += '</li>';
              
              
          $('.thumbnails').append( thumbBlock );
          
          $('[data-reveal-id="' + imageId + '"]').click(function(){
            
            // add padding to body to be able to scroll
            var modalHeight = $('body').height(); 
            
                $('.modal').attr('id', imageId );
                $('body').css({ 'padding-bottom' : modalHeight * 1.5 });
            
            renderModal( imageOwner, imageId, imgCaption, imageUrl, imgUser, comments );
            
            $.each( value.comments.data, function( group, key ){
              
              var commentBlock  = '<div class="row-fluid">';
                  commentBlock += '<div class="span2"><img src="' + key.from.profile_picture + '" style="width: 36px; height: 36px; margin-right: 10px; vertical-align: middle;" class="img-polaroid" /></div>';
                  commentBlock += '<div class="span9 offset1">';
                  commentBlock += '<a href="http://www.instagram.com/' + key.from.username + '"><strong>' + key.from.username + '</strong></a><br />';
                  commentBlock += key.text;
                  commentBlock += '</div>';
                  commentBlock += '</div><!-- end of .row-fluid -->';
              
              $('.modal-comments').append(commentBlock);
            });            

            $('#' + imageId ).modal(); //*! fire modal window
            
          });
        });

        paginate( data.pagination.next_url ); //*! paginate through images
      }
    });
  }

  function paginate( nextUrl ){
    if ( nextUrl === undefined || nextUrl === null ) {
      $('.btn').click(function(e){
        e.preventDefault();
        $(this)
          .removeClass('btn-success')
          .addClass('disabled btn-secondary');
      });
    } else {
      $('.btn').click(function(event){
        event.preventDefault();
          ajaxRequest( nextUrl );  //*! Load Succeeding Pages.
          $(this).unbind(event);   //*! Unbind all attached events.
      });
    }
  }
  
  function requestData ( request, count, accessID, accessToken, targetElement, pager ){
    var $apiRequest   = 'https://api.instagram.com/v1/users/',  
        $requestCount = ( count !== null ) ?  
          '?count=' +  count + '&access_token=' + accessToken :
          '?count=' +    8   + '&access_token=' + accessToken ,
        loadBtnData  = ( request === null ) ? 'recent' : request ;
    
    if ( request === null || request === 'recent' ){
      var $recentMedia = $apiRequest + accessID + '/media/recent' + $requestCount; 
          // Load Recent Media
          ajaxRequest( $recentMedia, request );
    }
    
    if ( request === 'liked' ){
      var $likedMedia = $apiRequest + 'self/media/liked' + $requestCount;
          // Load Liked Media
          ajaxRequest( $likedMedia );
    }

    if ( request === 'feed' ){
      var $feedMedia = $apiRequest + 'self/feed' + $requestCount;
          // Load User Feed
          ajaxRequest( $feedMedia );
    }
    
    if ( request === 'tag' ){
      var $displayTag = $apiRequest 
    }
        
    renderHTML( targetElement, loadBtnData, pager );

  }

  function accessDetails( accessID, accessToken ){
    if ( accessID !== null || accessToken !== null ) {
        return true;
      } else {
          console.log('Please check whether your Access ID and Access Token if it\'s valid.' );
          console.log('You may visit http://instagram.com/developer/authentication/ for more info.');
        return false;
    }
  }

  $.fn.pongstgrm = function( options ){
    
    if ( typeof callback == 'function'){
      callback.call(this);
    }
    
    // Plugin Options
    var option  = $.extend({}, $.fn.pongstgrm.defaults, options);
    
    return this.each( function(i, element){
      if ( accessDetails( option.accessId, option.accessToken ) !== false ){
        requestData( option.show, option.count, option.accessId, option.accessToken, element, option.pager );
      }
    });  //*! end return this.each;
  
  
  };     //*! end $.fn.pongstagrm;
   
  // Pongstagram Default Options
  $.fn.pongstgrm.defaults = {

    // User Authentication
    accessId     : null,  // instsagram user-id
    accessToken  : null,  // instagram access-token

    // Display options
    show         : null,    // string,  options: 'recent', 'feed', 'liked', 'user'
    count        : null,    // integer, options: 1(min) - 40(max), instagram limits the maximum number of photos to 40
    resolution   : null,    // string,  options: 'low_resolution', 'standard_resolution'
    pager        : null     // boolean, options:  true or false (enables/disable load more button)
    
  };
   
 })(jQuery, window, document);