$(document).ready(function(){
	var pseudo;
	var pwd;
	var key = 'v=3.0&key=d70ca308bef2';
	var token;
	var userId;
	var serieSearch;
	var navbar = "<nav class='navbar navbar-inverse navbar-fixed-top col-md-12'>"+
    "<div class='navbar-header col-md-1'>"+
    "<a class='navbar-brand' href='#'>PreviouslyOn</a>"+
    "</div>"+
    "<ul class='nav navbar-nav col-md-11' id='searchBarAndIcones'>"+
      "<li class='col-md-offset-1 col-md-8'><input type='text' name='search' placeholder='Recherche...' id='search' class='col-md-10'><button type='submit' class='btn btn-default col-md-2' id='searchSubmit'>Rechercher <i class='fa fa-search' aria-hidden='true'></i></button></li>"+
      "<li class='col-md-offset-1 col-md-2'>"+
      "<img src='img/series.png' id='BtnMesSeries' data-toggle='popover-info' data-trigger='hover' data-placement='bottom' data-content='Séries'/>"+
      "<img src='img/friends.png' id='BtnMesAmis'data-toggle='popover' data-trigger='hover' data-placement='bottom' data-content='Amis'/>"+
      "<img src='img/notifications.png' id='BtnMesNotifs' data-toggle='popover' data-trigger='hover' data-placement='bottom' data-content='Notifications'//>"+
      "</li>"+
    "</ul>"+
	"</nav>";

//Authentification.
$('#form').submit(function(e){
	e.preventDefault();
	pseudo = $('#pseudo').val();
	pwd = $('#pwd').val();
	connexion();
});

//Me connecte directement grace au localStorage
if(window.localStorage.getItem("pseudo") != null){
	pseudo = window.localStorage.getItem("pseudo");
	pwd = window.localStorage.getItem("pwd");
	connexion();
}

//Connexion
function connexion(){
	$.ajax({
		type: 'POST',
		url: "https://api.betaseries.com/members/auth?"+key ,
		data: 'login='+pseudo+'&password='+md5(pwd),
		success: function(rep){
			token = rep.token;
			userId = rep.user.id;
			window.localStorage.setItem('pseudo', pseudo);
			window.localStorage.setItem('pwd', pwd);
			$("#content").empty();
			$("#header").html(navbar);
			afficheAllSeries();
		},
		error: function(err, rep){
			$('#informations').html('<p id="messageError">Mauvais pseudo ou mauvais mot de passe</p>');
		},
		dataType: 'JSON',
	});
}

//PARTIE I : TOUTES LES SERIES
//Affiche la liste des séries à découvrir.
function afficheAllSeries(){
	$.ajax({
		type: 'GET',
		url: "https://api.betaseries.com/shows/discover?"+key,
		success: function(rep){
			listeAllSeries(rep.shows);
		},
		error: function(err, rep){
		  	// console.log(err);
		  },
		  dataType: 'JSON',
		});
}

//Affichage des series à découvrir.
function listeAllSeries(rep){
	var postersSeriesADecouvrir = "";
	for (var i = 0; i < rep.length; i++) {
		postersSeriesADecouvrir += '<img src="'+rep[i].images.poster+'" class="postersSeries" id='+ rep[i].id+'>';
	};
	$("#content").html("<h1 class='titleAccueil'>Nouvelles séries à découvrir...</h1><div id='allPosters'>"+postersSeriesADecouvrir+"</div>");

	//Evenement des fonctionnalité de la navbar.
	function eventNavbar(){
		//Redirige a l'accueil au click sur "PreviouslyOn".
		$(".navbar-brand").click(function(){
			afficheAllSeries();
		});

		//Infobulle lors du hover sur les icones.
	    $("#BtnMesSeries").popover({delay: { show: 500, hide: 500 }, trigger:'hover'}); 
	    $("#BtnMesAmis").popover({delay: { show: 500, hide: 500 }, trigger:'hover'}); 
	    $("#BtnMesNotifs").popover({delay: { show: 500, hide: 500 }, trigger:'hover'}); 


		//Affichage de mes series.
		$("#BtnMesSeries").click(function() {
			afficheMesSeries();
		});

		//Affichage de mes amis.
		$("#BtnMesAmis").click(function() {
			afficheMesAmis();
		});

		//Affichage la liste de mes amis.
		function afficheMesAmis(){
			$("#content").empty();
			$.ajax({
				type: 'GET',
				url: "https://api.betaseries.com/friends/list?"+key ,
				data: 'token='+token,
				success: function(rep){
					listeMesAmis(rep.users);
				},
				error: function(err, rep){
					// console.log(err);
				},
				dataType: 'JSON',
			});
		}

		//Liste mes amis et les demandes d'ajout.
		function listeMesAmis(rep){
			$.ajax({
				type: 'GET',
				url: "https://api.betaseries.com/members/notifications?"+key ,
				data: 'token='+token+"&types=friend",
				success: function(rep){
					var demandesAmis = "";
					for(var y = 0; y < rep.notifications.length; y++){
						demandesAmis +=
						"<div class='panel panel-info'>"+
				        "<div class='panel-heading'><h2>Demande d'ajout en attente</h2></div>"+
				        "<div class='panel-body'>"+
				        "<div id='allMyAsk'>"+
				        "<p class='col-md-10 textNotifs'>"+rep.notifications[y].text+"</p>"+
				        "<button class='btn btn-primary acceptFriend' id='"+rep.notifications[y].ref_id+"'>Accepter <i class='fa fa-check' aria-hidden='true'></i></button>"+
				        "</div>"+
				        "</div>";
				        "</div>";
					}
					$("#demandesAmis").html(demandesAmis);

					//Accepte l'ami qui a envoyé la demande.
					$(".acceptFriend").click(function(){
						var demandesAmisId = $(this).attr("id");;
						$.ajax({
							type: 'POST',
							url: "https://api.betaseries.com/friends/friend?"+key ,
							data: 'token='+token+"&id="+demandesAmisId,
							success: function(rep){
								location.reload();
							},
							error: function(err, rep){
								// console.log(err);
							},
							dataType: 'JSON',
						});
					})
				},
				error: function(err, rep){
					// console.log(err);
				},
				dataType: 'JSON',
			});

			var pseudoAmis = "";
			for (var i = 0; i < rep.length; i++) {
				pseudoAmis += "<div id='allMyFriends' class='col-md-12'>"+
				"<p class='pseudoAmis col-md-7' id='"+rep[i].id+"'>"+rep[i].login+"</p>"+
				"<button class='btn bloquer' id='"+rep[i].id+"'>Bloquer <i class='fa fa-ban' aria-hidden='true'></i></button>"+
				"<button class='btn supprimer btn-danger' id='"+rep[i].id+"'>Supprimer <i class='fa fa-trash' aria-hidden='true'></i></button><br/>"+
				"</div>";
			};
			$("#content").html("<div class='col-md-12 contentFriends'>"+
				"<input type='text' name='searchFriends' id='searchFriends' placeholder='Rechercher un ami...' class='col-md-11'>"+
				"<button class='btn searchFriends btn-default col-md-1'>Rechercher <i class='fa fa-search' aria-hidden='true'></i></button>"+
				"</div>"+
				"<div class='col-md-offset-1 col-md-5 listAmis'>"+
				"<div class='panel panel-info'>"+
		        "<div class='panel-heading'><h2>Mes amis</h2></div>"+
		        "<div class='panel-body'>"+pseudoAmis+"</div>"+
		        "</div>"+
				"</div>"+
				"<div class='col-md-5' id='demandesAmis'></div>");

			//Bloque un ami.
			$(".bloquer").click(function(){
				var friendId = $(this).attr("id");
				$.ajax({
					type: 'POST',
					url: "https://api.betaseries.com/friends/block?"+key ,
					data: 'token='+token+"&id="+friendId,
					success: function(rep){
						location.reload();
					},
					error: function(err, rep){
						// console.log(err);
					},
					dataType: 'JSON',
				});
			})

			//Supprime un ami.
			$(".supprimer").click(function(){
				var friendId = $(this).attr("id");
				$.ajax({
					type: 'DELETE',
					url: "https://api.betaseries.com/friends/friend?"+key ,
					data: 'token='+token+"&id="+friendId,
					success: function(rep){
						location.reload();
					},
					error: function(err, rep){
						// console.log(err);
					},
					dataType: 'JSON',
				});
			})

			//Recherche un ami et l'affiche.
			$(".searchFriends").click(function(){
				var email = $("#searchFriends").val();
				console.log(email);
				$.ajax({
					type: 'GET',
					url: "https://api.betaseries.com/friends/find?"+key ,
					data: 'token='+token+"&type=emails&emails="+email,
					success: function(rep){
						var resultFriendsSearch = "";
						for(var x = 0; x < rep.users.length; x++){
							resultFriendsSearch += "<div class='resultFriendsSearch col-md-offset-3 col-md-6'>"+
							"<div class='panel panel-success'>"+
					        "<div class='panel-heading'><h2>Resultat pour la recherche <strong>"+rep.users[x].name+"</strong></h2></div>"+
					        "<div class='panel-body'>"+
					        "<p class='col-md-10 searchFriendsLogin' id='"+rep.users[x].id+"'>"+rep.users[x].login+"</p>"+
					        "<button class='btn btn-primary addFriend'  id='"+rep.users[x].id+"'>Ajouter <i class='fa fa-plus' aria-hidden='true'></i></button>"+
					        "</div>"+
					        "</div>"+
					        "</div>";
						}
						$("#content").empty();
						$("#content").html(resultFriendsSearch);

						//Ajoute l'ami recherché.
						$(".addFriend").click(function(){
							var friendId = $(this).attr("id");
							$.ajax({
								type: 'POST',
								url: "https://api.betaseries.com/friends/friend?"+key ,
								data: 'token='+token+"&id="+friendId,
								success: function(rep){
									location.reload();
								},
								error: function(err, rep){
									// console.log(err);
								},
								dataType: 'JSON',
							});
						})

					},
					error: function(err, rep){
						console.log(err);
					},
					dataType: 'JSON',
				});
			})
		}

		//Affichage de mes notifications.
		$("#BtnMesNotifs").click(function() {
			afficheMesNotifs();
		});

		//Affichage la liste de mes notifications.
		function afficheMesNotifs(){
			$("#content").empty();
			$.ajax({
				type: 'GET',
				url: " https://api.betaseries.com/timeline/member?"+key ,
				data: 'id='+userId,
				success: function(rep){
					listeMesNotifs(rep.events);
				},
				error: function(err, rep){
					// console.log(err);
				},
				dataType: 'JSON',
			});
		}

		//Liste mes notifications.
		function listeMesNotifs(rep){
			var mesNotifs = "";
			for(var z = 0; z < rep.length; z++){
				mesNotifs += "<div class='panel panel-info notifs'>"+
		        "<div class='panel-heading'><p class='dateNotif'><strong>"+rep[z].date+"</strong></p></div>"+
		        "<div class='panel-body'><p class='notifsText'>"+rep[z].user+" "+rep[z].html+"</p></div>"+
		        "</div>";
			}
			$("#content").html("<h1 class='titleNotifs'>Notifications</h2>"+mesNotifs);
			eventNavbar();
		}

		// /Affichage des series recherchées.
		$('#searchSubmit').click(function(e){
			e.preventDefault();
			serieSearch = $('#search').val();
			searchSeries();
		});

		//Récuperation des séries avec la barre de recherche.
		function searchSeries(){
			$.ajax({
				type: 'GET',
				url: "https://api.betaseries.com/shows/search?"+key ,
				data: 'title='+serieSearch,
				success: function(rep){
					$("#content").empty();
					var postersSeriesSearch = "";
					for (var a = 0; a < rep.shows.length; a++) {
						postersSeriesSearch += "<img src='"+rep.shows[a].images.poster+"' class='postersSeries' id='"+ rep.shows[a].id+"'>";
					};
					$("#content").html("<h1>Résultat pour la recherche '"+serieSearch+"'</h1>"+postersSeriesSearch);
					eventClickSeries();
				},
				error: function(err, rep){
					// console.log(err);
				},
				dataType: 'JSON',
			});
		}
	}
	eventNavbar();

	// /Affichage des informations de la serie.
	function eventClickSeries(){
		$(".postersSeries").click(function() {
			var idSerie = $(this).attr("id");
			$("#content").empty();
			$.ajax({
				type: 'GET',
				url: "https://api.betaseries.com/shows/display?"+key ,
				data: 'id='+idSerie,	
				success: function(rep){
					var poster = rep.show.images.poster;
					var titleSerie = rep.show.title;
					var infoSerie = "<div class='col-md-4'><img src='"+rep.show.images.poster+"' class='poster'></div>"+
					"<div class='col-md-8 btnInfoSerie'>"+
					"<button class='addSerie btn btn-lg btn-primary'>Ajouter la série <i class='fa fa-plus' aria-hidden='true'></i></button>"+
					"<button class='btn btn-lg btn-primary btnEpisode'>Voir les épisodes <i class='fa fa-eye' aria-hidden='true'></i></button>"+
					"</div>"+
					"<div class='col-md-offset-4 col-md-2 infosSeries'><p><strong>Titre : </strong>"+rep.show.title+"</p>"+
					"<p><strong>Genres : </strong>"+rep.show.genres+"</p>"+
					"<p><strong>Création : </strong>"+rep.show.creation+"</p>"+
					"<p><strong>Saisons : </strong>"+rep.show.seasons+"</p>"+
					"<p><strong>Episodes : </strong>"+rep.show.episodes+"</p>"+
					"<p><strong>Durée : </strong>"+rep.show.length+" min</p>"+
					"<p><strong>Note : </strong>"+rep.show.notes.mean+"/5</p></div>"+
					"<div class='col-md-5 resum'><p><strong>Résumé : </strong>"+rep.show.description+"</p></div>";
					$("#content").html(infoSerie);

				  	//Ajoute la série.
				  	$(".addSerie").click(function() {
				  		$.ajax({
				  			type: 'POST',
				  			url: "https://api.betaseries.com/shows/show?"+key,
				  			data: 'token='+token+'&id='+idSerie,
				  			success: function(rep){
					  			location.reload();
						  	},
						  	error: function(err, rep){
						  		// console.log(err);
						  	},
						  	dataType: 'JSON',
						  });
				  	});

					// Affiche les episodes
					$(".btnEpisode").click(function() {
						$("#content").empty();
						$.ajax({
							type: 'GET',
							url: "https://api.betaseries.com/shows/episodes?"+key,
							data: "id="+idSerie,
							success: function(rep){
								var nbrEpisodes = rep.episodes;
								var episodes = "";
								for(y = 0; y < nbrEpisodes.length; y++){
									episodes += "<p class='episodes' id='"+nbrEpisodes[y].id+"'>" + nbrEpisodes[y].title + " - Saisons "+nbrEpisodes[y].season+"</p><br/>";
								}
								$("#content").html("<div class='episodesRemaining col-md-offset-3 col-md-6'>"+
								"<div class='panel panel-success'>"+
							    "<div class='panel-heading'><h1><strong>Tout les épisodes</strong></h1></div>"+
							    "<div class='panel-body'>"+episodes+"</div>"+
							    "</div>"+
							    "</div>");

								$(".episodes").click(function(){
						  			//this = l'épisode sur le quelle on a cliqué
						  			var episodeId = $(this).attr("id");

						  			$.ajax({
						  				type: 'GET',
						  				url: "https://api.betaseries.com/comments/comments?"+key,
						  				data: 'id='+episodeId+'&type=episode',
						  				success: function(rep){
										var nbrComments = rep.comments;
										var allComments = "";
											for(var n = 0; n < nbrComments.length; n++){
												allComments += 
												"<li>"+
												"<div class='commenterImage'>"+
												"<img src='"+nbrComments[n].avatar+"'/>"+
												"</div>"+
												"<div class='commentText'>"+
												"<p class=''>"+nbrComments[n].text+"</p> <span class='date sub-text'>"+nbrComments[n].date+"</span>";
												"</div>"+
												"</li>";
											}
											var afficheAllComments = "<div class='detailBox'>"+
											"<div class='titleBox'>"+
											"<label>Commentaires de l'épisode</label>"+
											"</div>"+
											"<div class='actionBox'>"+
											"<ul class='commentList'>"+
											allComments+
											"</ul>"+
											"</div>"+
											"</div>";
											$("#commentsGen").html(afficheAllComments);
										},
										error: function(err, rep){
											// console.log(err);
										},
										dataType: 'JSON',
									});

						  			$("#content").empty();

						  			$.ajax({
						  				type: 'GET',
						  				url: "https://api.betaseries.com/episodes/display?"+key,
						  				data: 'id='+episodeId,
						  				success: function(rep){
						  					var contentEpisode = "<div class='col-md-4'><img src='"+poster+"' class='poster'></div>"+
						  					"<div class='col-md-2 infoEpisode'>"+
						  					"<p>"+rep.episode.code+"</p>"+
						  					"<p><strong>Date de diffusion : </strong>"+rep.episode.date+"</p>"+
						  					"<p><strong>Titre de l'épisode : </strong>"+rep.episode.title+"</p>"+
						  					"<p><strong>Note : </strong>"+rep.episode.note.mean+"/5</p>"+
						  					"</div>"+
						  					"<div class='col-md-5 resumEpisode'>"+
						  					"<p><strong>Résumé : </strong>"+rep.episode.description+"</p>"+
						  					"</div>"+
						  					"<div class='col-md-offset-4 col-md-8' id='commentsGen'>"+
						  					"</div>";

							  				$("#content").html(contentEpisode);
						  				},
						  				error: function(err, rep){
						  					// console.log(err);
						  				},
						  				dataType: 'JSON',
						  			});
						  		});
							},
							error: function(err, rep){
								// console.log(err);
							},
							dataType: 'JSON',
						});
					});
				},
				error: function(err, rep){
					// console.log(err);
				},
				dataType: 'JSON',
			});
		});
	}
	eventClickSeries();
}

//PARTIE II : MES SERIES SUIVIS
//Récupération des series suivis.
function afficheMesSeries(){
	$("#content").empty();
	$.ajax({
		type: 'GET',
		url: "https://api.betaseries.com/episodes/list?"+key ,
		data: 'token='+token,
		success: function(rep){
			listeMesSeries(rep.shows);
		},
		error: function(err, rep){
			// console.log(err);
		},
		dataType: 'JSON',
	});
}

//Affichage des series suivis.
function listeMesSeries(rep){
	var titleSerie = "";
	for (var i = 0; i < rep.length; i++) {
		titleSerie += "<p class='titleSerie' id="+ rep[i].id+">"+rep[i].title+" <span class='text-muted remaining'>("+rep[i].remaining+" épisodes réstant)</span></p><br/>";
	};
	$("#content").html("<div class='mesSeries col-md-offset-3 col-md-6'>"+
	"<div class='panel panel-info'>"+
    "<div class='panel-heading'><p class='dateNotif'><h1><strong>Mes series</strong></h1></p></div>"+
    "<div class='panel-body'>"+titleSerie+"</div>"+
    "</div>"+
    "</div>");

	//Affichage des informations de la serie.
	function eventClickMySeries(){
		$(".titleSerie").click(function() {
			var idSerie = $(this).attr("id");
			$("#content").empty();
			$.ajax({
				type: 'GET',
				url: "https://api.betaseries.com/shows/display?"+key ,
				data: 'id='+idSerie,
				success: function(rep){
					var idSerie = rep.show.id;
					var poster = rep.show.images.poster;
					var titleSerie = rep.show.title;
					var infoSerie = "<div class='col-md-4'><img src='"+rep.show.images.poster+"' class='poster'></div>"+
					"<div class='col-md-8 btnInfoSerie'>"+
					"<button class='archiveSerie btn btn-lg btn-primary'>Archiver la série <i class='fa fa-archive' aria-hidden='true'></i></button>"+
					"<button class='btn btn-lg btn-primary btnEpisode'>Voir les épisodes <i class='fa fa-eye' aria-hidden='true'></i></button>"+
					"</div>"+
					"<div class='col-md-offset-4 col-md-2 infosSeries'><p><strong>Titre : </strong>"+rep.show.title+"</p>"+
					"<p><strong>Genres : </strong>"+rep.show.genres+"</p>"+
					"<p><strong>Création : </strong>"+rep.show.creation+"</p>"+
					"<p><strong>Saisons : </strong>"+rep.show.seasons+"</p>"+
					"<p><strong>Episodes : </strong>"+rep.show.episodes+"</p>"+
					"<p><strong>Durée : </strong>"+rep.show.length+" min</p>"+
					"<p><strong>Note : </strong>"+rep.show.notes.mean+"/5</p></div>"+
					"<div class='col-md-5 resum'><p><strong>Résumé : </strong>"+rep.show.description+"</p></div>";
					$("#content").html(infoSerie);

				// Archive la série.
				$(".archiveSerie").click(function() {
					$.ajax({
						type: 'POST',
						url: "https://api.betaseries.com/shows/archive?"+key,
						data: 'token='+token+'&id='+idSerie,
						success: function(rep){
							location.reload();
					  	},
					  	error: function(err, rep){
					  		// console.log(err);
					  	},
					  	dataType: 'JSON',
					  });
				});

				// Affiche les episodes
				$(".btnEpisode").click(function() {
					$("#content").empty();
					$.ajax({
						type: 'GET',
						url: "https://api.betaseries.com/episodes/list?"+key,
						data: 'token='+token+'&showId='+idSerie,
						success: function(rep){
							var nbrEpisodes = rep.shows[0].unseen;
							var episodes = "";
							for(y = 0; y < nbrEpisodes.length; y++){
								episodes += "<p class='episodes col-md-10' id='"+nbrEpisodes[y].id+"'>" + nbrEpisodes[y].title + " - Saisons "+nbrEpisodes[y].season+"</p>"+
								"<button class='btn btn-sm btnNonVue btn-success ' id='"+nbrEpisodes[y].id+"'>Ajouter comme vue <i class='fa fa-check' aria-hidden='true'></i></button><br/>";
							}
							$("#content").html("<div class='episodesRemaining col-md-offset-2 col-md-8'>"+
							"<div class='panel panel-success'>"+
						    "<div class='panel-heading'><h1><strong>Episodes réstant</strong></h1></div>"+
						    "<div class='panel-body'>"+episodes+"</div>"+
						    "</div>"+
						    "</div>");

							// Marque l'épisode comme vue
							$(".btnNonVue").click(function(){
								var episodeId = $(this).attr("id");
								$.ajax({
									type: 'POST',
									url: "https://api.betaseries.com/episodes/watched?"+key,
									data: 'token='+token+'&id='+episodeId,
									success: function(rep){
										location.reload();
									},
									error: function(err, rep){
										// console.log(err);
									},
									dataType: 'JSON',
								});
							});

							//Affiche les détails de l'épisode.
							$(".episodes").click(function(){
					  			//this = l'épisode sur le quelle on a cliqué
					  			var episodeId = $(this).attr("id");

					  			$.ajax({
					  				type: 'GET',
					  				url: "https://api.betaseries.com/comments/comments?"+key,
					  				data: 'id='+episodeId+'&type=episode',
					  				success: function(rep){
										// location.reload();
										// console.log(rep);
										var nbrComments = rep.comments;
										var allComments = "";
										for(var n = 0; n < nbrComments.length; n++){
											allComments += 
											"<li>"+
											"<div class='commenterImage'>"+
											"<img src='"+nbrComments[n].avatar+"'/>"+
											"</div>"+
											"<div class='commentText'>"+
											"<p class=''>"+nbrComments[n].text+"</p> <span class='date sub-text'>"+nbrComments[n].date+"</span>";
											"</div>"+
											"</li>";
										}
										var afficheAllComments = "<div class='detailBox'>"+
										"<div class='titleBox'>"+
										"<label>Commentaires de l'épisode</label>"+
										"</div>"+
										"<div class='actionBox'>"+
										"<ul class='commentList'>"+
										allComments+
										"</ul>"+
										"</div>"+
										"</div>";
										$("#comments").html(afficheAllComments);
									},
									error: function(err, rep){
										// console.log(err);
									},
									dataType: 'JSON',
								});

					  			$("#content").empty();

					  			$.ajax({
					  				type: 'GET',
					  				url: "https://api.betaseries.com/episodes/display?"+key,
					  				data: 'id='+episodeId,
					  				success: function(rep){
					  					var contentEpisode = "<div class='col-md-4'><img src='"+poster+"' class='poster'></div>"+
					  					"<div class='col-md-2 infoEpisode'>"+
					  					"<p>"+rep.episode.code+"</p>"+
					  					"<p><strong>Date de diffusion : </strong>"+rep.episode.date+"</p>"+
					  					"<p><strong>Titre de l'épisode : </strong>"+rep.episode.title+"</p>"+
					  					"<p><strong>Note : </strong>"+rep.episode.note.mean+"/5</p>"+
					  					"</div>"+
					  					"<div class='col-md-5 resumEpisode'>"+
					  					"<p><strong>Résumé : </strong>"+rep.episode.description+"</p>"+
					  					"</div>"+
					  					"<div class='col-md-offset-4 col-md-4 ecrireCom'>"+
					  					"<h3>Laisser un commentaire :</h3>"+
					  					"<textarea type='text' id='commentaire' name='commentaire' placeholder='Laisser un commentaire...' rows='10px' cols='60px'></textarea></br>"+
					  					"<button class='btn btn-primary addCom'>Envoyer le commentaire</button>"+
					  					"</div>"+
					  					"<div class='col-md-4' id='comments'>"+
					  					"</div>";
					  					
					  					$("#content").html(contentEpisode);

					  					//Ajoute un commentaire
					  					$(".addCom").click(function(){
					  						var commentaire = $("#commentaire").val();
					  						$.ajax({
					  							type: 'POST',
					  							url: "https://api.betaseries.com/comments/comment?"+key,
					  							data: 'token='+token+'&text='+commentaire+"&id="+episodeId+"&type=episode",
					  							success: function(rep){
													// console.log(rep);
													location.reload();
												},
												error: function(err, rep){
													// console.log(err);
												},
												dataType: 'JSON',
											});
					  					})
					  				},
					  				error: function(err, rep){
					  					// console.log(err);
					  				},
					  				dataType: 'JSON',
					  			});
					  		});
						},
						error: function(err, rep){
							// console.log(err);
						},
						dataType: 'JSON',
					});
				});
				},
				error: function(err, rep){
					// console.log(err);
				},
				dataType: 'JSON',
			});
		});
	}
	eventClickMySeries();
}

});