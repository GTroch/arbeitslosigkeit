

var app = angular.module("spa", []);


app.controller("controller", function ($scope, $window) {
    $scope.choices = [];
    var s1PieceCount = 7;
    var s2PieceCount = 6;
    $scope.currentRound = 0;

    $scope.solutionShown = false;

    //puzzle pieces mobile
    $scope.neoChoices = [];
    $scope.keynesChoices = []

    //selected tiles and pieces of mobile version
    $scope.selectedPiece = null;
    $scope.selectedTileIdx = -1;
    $scope.selectedPieceIdx = -1;

    $scope.round1Container = [];
    $scope.round2Container = [];

    //containers of task 3
    $scope.neoBox = [];
    $scope.keynesBox = [];

    $scope.showTables = false;

    $scope.lowWidth = $(window).width() <= 768 ? true : false;

    $scope.evaluationPossible = false;

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    });

    $scope.choicesText = [
        "Senkung der Unternehmenssteuer und der Lohnnebenkosten",
        "Flexibilisierung der Arbeitszeiten, Ermöglichung von Teilzeitarbeit und Befristungen der Arbeitsverträge",
        "Verhinderung bzw. Abschaffung von Mindestlöhnen",
        "Senkung des Lohnniveaus",
        "Lockerung des Kündigungsschutzes",
        "Kürzung von Arbeitslosengeld und Sozialhilfe als Anreiz zur Arbeitsaufnahme",
        "regionale Differenzierung der Löhne",
        "Senkung der Einkommens- und Mehrwertsteuer zur Erhöhung der Konsumgüternachfrage",
        "Verringerung der Wochenarbeitszeit",
        "Einführung bzw. Erhöhung der Mindestlöhne",
        "Erhöhung der Sozialleistungen für einkommensschwache Haushalte",
        "Lohnerhöhungen zur Steigerung der Konsumgüternachfrage",
        "Staatlich subventionierte Nachfrage nach Arbeitskräften in Form eines Kombilohns",
        "Kreditfinanzierte staatliche Investitionen in Bildungsinstitutionen und Infrakstrukturmaßnahmen"
    ];

    for (var i = 0; i < 14; i++) {
        $scope.choices[i] = { idx: i + 1, text: $scope.choicesText[i] };
    }
    for (var i = 0; i < 7; i++) {
        $scope.keynesChoices[i] = { idx: i + 1, active: false };
        $scope.round1Container[i] = null;
        if (i < 6) {
            $scope.neoChoices[i] = { idx: i + 1, active: false };
            $scope.round2Container[i] = null;
        }
    }


    $scope.introSkipped = false;
    $scope.finished = false;

    $scope.rounds = [
        { name: "round1", solved: false, tries: 0 },
        { name: "round2", solved: false, tries: 0 },
        { name: "round3", solved: false, tries: 0 }
    ];

    //shuffle arrays for randomness
    shuffleArray($scope.choices);
    shuffleArray($scope.keynesChoices);
    shuffleArray($scope.neoChoices);

    $scope.isTopMostChoice = function (idx) {
        return idx == $scope.choices.length;
    }

    if ($scope.currentRound == 2 && !$scope.lowWidth) {
        let maxContainerHeight = window.innerHeight - $(".foot").height() - $(".app-title").height();
        let maxContainerWidth = maxContainerHeight * 1.1;

        $(".sb-wrapper").css("maxWidth", maxContainerWidth);
    } else if ($scope.currentRound < 2 && !$scope.lowWidth) {
        let maxContainerHeight = window.innerHeight - $(".foot").height() - $(".app-title").height();
        let maxContainerWidth = maxContainerHeight * 1.4;

        $(".sb-wrapper").css("maxWidth", maxContainerWidth);
    }

    let maxImgHeight = ($(".mainFrame").width() / 2) * 0.9;
    $(".pieceRow").height(maxImgHeight);

    $scope.content2high = function () {
        let visibleHeight = $(window.top).height();
        let contentHeight = $("#content").height();
        let footerHeight = $(".foot").height();
        console.log("vis: " + visibleHeight);
        console.log("con: " + contentHeight);
        console.log("foot: " + footerHeight);

        return ((contentHeight + footerHeight) > visibleHeight);
    }

    $("#modalIntro").modal('show');

    $("#skipIntro").click(function () {
        $scope.introSkipped = true;
        console.log("click");
        $scope.content2high();
        $scope.$apply();
    });

    $scope.putBack = function (piece) {
        piece.parent().children().eq(0).show();
        if ($scope.currentRound == 0) {
            $("#a-1 .mainFrame .dropAvailable").first().append(piece);
            $("#a-1 .mainFrame .dropAvailable").first().removeClass("dropAvailable");
        } else if ($scope.currentRound == 1) {
            $("#a-2 .mainFrame .dropAvailable").first().append(piece);
            $("#a-2 .mainFrame .dropAvailable").first().removeClass("dropAvailable");
        }

    }

    $scope.putLeft = function () {
        if ($scope.neoBox.length <= 6) {
            $scope.neoBox.push($scope.choices.pop());
        }

    }

    $scope.putRight = function () {
        if ($scope.keynesBox.length <= 6) {
            $scope.keynesBox.push($scope.choices.pop());
        }
    }

    $scope.boxFull = function (id) {
        let full = false;
        if (id == 0) {
            full = $scope.neoBox.length >= 7;
        } else {
            full = $scope.keynesBox.length >= 7;
        }
        if (full) {
            $scope.checkEvalPossible();
        }
        return full;
    }



    //Init Drag & Drop
    $(".draggable").draggable({
        revert: true,
        zIndex: 1000,
        start: function (e, ui) {
            $(this).parent().children().eq(0).show();
            $(this).removeClass("dropped");
        }
    });

    $(".droppable").droppable({
        hoverClass: "pieceHover",
        greedy: true,
        drop: function (e, ui) {
            console.log(ui.draggable);
            // $(this).html(ui.draggable.remove().html());
            console.log(ui.draggable.parent());
            if (ui.draggable.hasClass("dropped")) {
                return false;
            }

            if ($(this).parent().hasClass("pieceRow")) {
                if ($(this).children().length == 0) {
                    ui.draggable.attr("style", "position:relative;");
                    $(this).append(ui.draggable);
                    ui.draggable.parent().removeClass("dropAvailable");
                }
            } else {
                if ($(this).children().length < 2) {
                    ui.draggable.parent().addClass("dropAvailable");
                    $(this).append(ui.draggable);
                    $(this).children().eq(0).hide();
                    $(this).children().eq(1).attr("style", "position:absolute;");
                    $(this).droppable('disable');
                    ui.draggable.parent().droppable('enable');
                }

            }
            ui.draggable.addClass("dropped");
            $scope.checkEvalPossible();
            $scope.$apply();
        }
    });

    $scope.checkSolution = function () {
        var solved = true;
        var childId = "";

        if ($scope.currentRound < 2) {
            currentRoundPieces = $scope.currentRound == 0 ? s1PieceCount : $scope.currentRound == 1 ? s2PieceCount : 0;

            for (var i = 1; i <= currentRoundPieces; i++) {
                childId = ("s" + ($scope.currentRound + 1) + "-p" + i);
                if ($("#s" + ($scope.currentRound + 1) + "-t" + i).children().eq(1).attr('id') != childId) {
                    solved = false;
                    if (typeof ($("#s" + ($scope.currentRound + 1) + "-t" + i).children().eq(1).attr('id')) != "undefined") {
                        console.log(childId);
                        $scope.putBack($("#" + $("#s" + ($scope.currentRound + 1) + "-t" + i).children().eq(1).attr('id')));
                    }
                }
            }
        } else if ($scope.currentRound == 2) {
            if ($scope.neoBox.length < 7 || $scope.keynesBox.length < 7) {
                solved = false;
            }
            for (var i = $scope.neoBox.length - 1; i >= 0; i--) {
                if ($scope.neoBox[i].idx > 7) {
                    solved = false;
                    var tmp = $scope.neoBox[i];
                    $scope.choices.push(tmp);
                    $scope.neoBox.splice(i, 1);
                }
            }
            for (var i = $scope.keynesBox.length - 1; i >= 0; i--) {
                if ($scope.keynesBox[i].idx <= 7) {
                    solved = false;
                    var tmp = $scope.keynesBox[i];
                    $scope.choices.push(tmp);
                    $scope.keynesBox.splice(i, 1);
                }
            }
            if(!solved)
            {shuffleArray($scope.choices);}
        }


        if (!solved) {
            $scope.rounds[$scope.currentRound].solved = false;
            $scope.rounds[$scope.currentRound].tries++;
            if ($scope.rounds[$scope.currentRound].tries >= 3) {
                $scope.showSolution();
                $scope.solutionShown = true;
                if ($scope.currentRound == 2) {
                    $scope.finished = true;
                }
            }
        } else {

            $scope.rounds[$scope.currentRound].solved = true;
            introSkipped = false;

            if ($scope.currentRound == 2) {
                $scope.finished = true;
            }

        }
        $("#solutionModal").modal('show');
        $scope.evaluationPossible = false;
    }

    $scope.showSolution = function () {
        if ($scope.currentRound < 2) {
            currentRoundPieces = $scope.currentRound == 0 ? s1PieceCount : $scope.currentRound == 1 ? s2PieceCount : 0;

            for (var i = 1; i <= currentRoundPieces; i++) {
                childId = ("#s" + ($scope.currentRound + 1) + "-p" + i);
                $("#s" + ($scope.currentRound + 1) + "-t" + i).append($(childId));
            }
            $(".placeholder").hide();
        } else {
            $scope.neoBox = [];
            $scope.keynesBox = [];
            $scope.choices = [];
            for (var i = 0; i < 7; i++) {
                $scope.neoBox.push({ idx: i + 1 });
                $scope.keynesBox.push({ idx: i + 8 });
            }
        }
    }

    $scope.showSolutionMobile = function () {
        if ($scope.currentRound == 0) {
            currentRoundPieces = s1PieceCount;
            for (var i = 0; i < currentRoundPieces; i++) {
                $scope.round1Container[i] = { idx: i + 1 }
            }
            $(".placeholder").hide();
        } else if ($scope.currentRound == 1) {
            currentRoundPieces = s2PieceCount;
            for (var i = 0; i < currentRoundPieces; i++) {
                $scope.round2Container[i] = { idx: i + 1 }
            }
            $(".placeholder").hide();
        } else {
            $scope.neoBox = [];
            $scope.keynesBox = [];
            $scope.choices = [];
            for (var i = 0; i < 7; i++) {
                $scope.neoBox.push({ idx: i + 1, text: $scope.choicesText[i] });
                $scope.keynesBox.push({ idx: i + 8, text: $scope.choicesText[i + 7] });
            }
        }
    }

    $scope.checkEvalPossible = function () {
        var possible = true;
        currentRoundPieces = $scope.currentRound == 0 ? s1PieceCount : $scope.currentRound == 1 ? s2PieceCount : 0;
        if ($scope.currentRound < 2) {
            for (var i = 1; i <= currentRoundPieces; i++) {
                if ($("#s" + ($scope.currentRound + 1) + "-t" + i).children().toArray().length < 2) {
                    possible = false;
                    // console.log("#s" + ($scope.currentRound + 1) + "-t" + i + " not occupied yet")
                }
            }
        } else {
            if ($scope.choices.length > 0) {
                possible = false;
            }
        }
        if (possible) {
            $scope.evaluationPossible = true;
        }
    }

    $scope.checkEvalPossibleMobile = function () {
        var possible = true;
        currentRoundPieces = $scope.currentRound == 0 ? s1PieceCount : $scope.currentRound == 1 ? s2PieceCount : 0;
        if ($scope.currentRound == 0) {
            $scope.round1Container.forEach(element => {
                if (element == null) {
                    possible = false;
                }
            });
        } else if ($scope.currentRound == 1) {
            $scope.round2Container.forEach(element => {
                if (element == null) {
                    possible = false;
                }
            });
        } else {
            if ($scope.choices.length > 0) {
                possible = false;
            }
        }

        if (possible) {
            $scope.evaluationPossible = true;
        }
    }

    $scope.checkSolutionMobile = function () {
        var solved = true;
        if ($scope.currentRound == 0) {
            for (var i = 0; i < $scope.round1Container.length; i++) {
                if ($scope.round1Container[i].idx != i + 1) {
                    solved = false;
                    $scope.round1Container[i].active = false;
                    $scope.keynesChoices.push($scope.round1Container[i]);
                    $scope.round1Container[i] = null;
                }
            }
        } else if ($scope.currentRound == 1) {
            for (var i = 0; i < $scope.round2Container.length; i++) {
                if ($scope.round2Container[i].idx != i + 1) {
                    solved = false;
                    $scope.round2Container[i].active = false;
                    $scope.neoChoices.push($scope.round2Container[i]);
                    $scope.round2Container[i] = null;
                }
            }
        } else {
            for (var i = $scope.neoBox.length - 1; i >= 0; i--) {
                if ($scope.neoBox[i].idx > 7) {
                    solved = false;
                }
            }
            for (var i = $scope.keynesBox.length - 1; i >= 0; i--) {
                if ($scope.keynesBox[i].idx <= 7) {
                    solved = false;
                }
            }
        }

        if (!solved) {
            $scope.rounds[$scope.currentRound].solved = false;
            $scope.rounds[$scope.currentRound].tries++;
            if ($scope.rounds[$scope.currentRound].tries >= 3) {
                $scope.showSolutionMobile();
                $scope.solutionShown = true;
                if ($scope.currentRound == 2) {
                    $scope.finished = true;
                }
            }

            if ($scope.currentRound == 2) {
                $scope.showTables = true;
            }
        } else {

            $scope.rounds[$scope.currentRound].solved = true;
            introSkipped = false;

            if ($scope.currentRound == 2) {
                $scope.finished = true;
            }

        }
        $("#solutionModal").modal('show');
        $scope.evaluationPossible = false;
    }

    $scope.nextRound = function () {

        if ($scope.currentRound < 2) {
            $scope.currentRound <= 2 ? $scope.currentRound++ : console.log("no more rounds");
            $("#solutionModal").modal('hide');
        } else {
            $window.location.reload();
        }

        if ($scope.currentRound == 2 && !$scope.lowWidth) {
            let maxContainerHeight = window.innerHeight - $(".foot").height() - $(".app-title").height();
            let maxContainerWidth = maxContainerHeight * 1.1;

            $(".sb-wrapper").css("maxWidth", maxContainerWidth);
        } else if ($scope.currentRound < 2 && !$scope.lowWidth) {
            let maxContainerHeight = window.innerHeight - $(".foot").height() - $(".app-title").height();
            let maxContainerWidth = maxContainerHeight * 1.4;

            $(".sb-wrapper").css("maxWidth", maxContainerWidth);
        }

        $scope.evaluationPossible = false;
        $scope.solutionShown = false;
        $(".placeholder").show();
    }

    $scope.goToRound = function (round) {
        $(".placeholder").show();
        $scope.evaluationPossible = false;
        $scope.solutionShown = false;
        $scope.currentRound = round;

        $("#round1Modal").modal('show');

        if ($scope.currentRound == 2 && !$scope.lowWidth) {
            let maxContainerHeight = window.innerHeight - $(".foot").height() - $(".app-title").height() ;
            let maxContainerWidth = maxContainerHeight * 1.1;

            $(".sb-wrapper").css("maxWidth", maxContainerWidth);
        } else if ($scope.currentRound < 2 && !$scope.lowWidth) {
            let maxContainerHeight = window.innerHeight - $(".foot").height() - $(".app-title").height();
            let maxContainerWidth = maxContainerHeight * 1.4;

            $(".sb-wrapper").css("maxWidth", maxContainerWidth);
        }

        $scope.rounds[round].tries = 0;

    }

    //Mobile Puzzle Auswahl
    $scope.openBox = function (tileIdx) {
        if ($scope.currentRound == 0) {
            if ($scope.round1Container[tileIdx] != null) {
                $scope.keynesChoices.push($scope.round1Container[tileIdx]);
                $scope.round1Container[tileIdx] = null;
                $scope.selectedPiece = $scope.keynesChoices[$scope.keynesChoices.length - 1];
                $scope.selectedPieceIdx = $scope.keynesChoices.length - 1;
            }

        } else if ($scope.currentRound == 1) {
            if ($scope.round2Container[tileIdx] != null) {
                $scope.neoChoices.push($scope.round2Container[tileIdx]);
                $scope.round2Container[tileIdx] = null;
                $scope.selectedPiece = $scope.neoChoices[$scope.neoChoices.length - 1];
                $scope.selectedPieceIdx = $scope.neoChoices.length - 1;
            }
        }
        $scope.selectedTileIdx = tileIdx;
        $("#piecesModal").modal("show");
    }

    $scope.pieceSelected = function (idx) {
        $scope.selectedPieceIdx = idx;
        if ($scope.currentRound == 0) {
            for (let i = 0; i < $scope.keynesChoices.length; i++) {
                i == idx ? $scope.keynesChoices[i].active = true : $scope.keynesChoices[i].active = false;
            }

            $scope.selectedPiece = $scope.keynesChoices[idx];
        } else {
            for (let i = 0; i < $scope.neoChoices.length; i++) {
                i == idx ? $scope.neoChoices[i].active = true : $scope.neoChoices[i].active = false;
            }

            $scope.selectedPiece = $scope.neoChoices[idx];
        }
    }

    $scope.choiceConfirmed = function () {
        console.log($scope.selectedPiece);
        if ($scope.selectedPiece != null) {
            if ($scope.currentRound == 0) {
                $scope.round1Container[$scope.selectedTileIdx] = $scope.selectedPiece;
                $scope.keynesChoices.splice($scope.selectedPieceIdx, 1);
            } else {
                $scope.round2Container[$scope.selectedTileIdx] = $scope.selectedPiece;
                $scope.neoChoices.splice($scope.selectedPieceIdx, 1);
            }
            $scope.selectedPiece = null;
            $scope.selectedPieceIdx = -1;
            $scope.checkEvalPossibleMobile();
        }
    }

    $scope.continueS3 = function () {
        for (var i = $scope.neoBox.length - 1; i >= 0; i--) {
            if ($scope.neoBox[i].idx > 7) {
                solved = false;
                var tmp = $scope.neoBox[i];
                $scope.choices.push(tmp);
                $scope.neoBox.splice(i, 1);
            }
        }
        for (var i = $scope.keynesBox.length - 1; i >= 0; i--) {
            if ($scope.keynesBox[i].idx <= 7) {
                solved = false;
                var tmp = $scope.keynesBox[i];
                $scope.choices.push(tmp);
                $scope.keynesBox.splice(i, 1);
            }
        }
        shuffleArray($scope.choices);
        $scope.showTables = false;
        $scope.evaluationPossible = false;
        $('[data-toggle="tooltip"]').tooltip();
    }

    /* Randomize array in-place using Durstenfeld shuffle algorithm */
    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    $scope.tooltips = [
        "Die Kosten für Unternehmen sinken, die Angebotsseite wird gestärkt.",
        "Unternehmen können Lohnkosten reduzieren, Arbeitskräfte nach Auftragslage einsetzen.",
        "Staatliche Mindestlöhne widersprechen der Annahme, dass der Markt am besten sich selbst überlassen werden sollte.",
        "Je niedriger das Lohnniveau, desto niedriger die Arbeitskosten für die Unternehmen.",
        "Einstellungen, Entlassungen sind leichter möglich. Unternehmen können flexibler reagieren.",
        "Dies stärkt die Angebotsseite der Unternehmen, da der Druck auf Arbeitslose steigt, auch für geringere Löhne zu arbeiten.",
        "In wirtschaftlich schwächeren Regionen eines Landes sollte es Unternehmen möglich sein, geringerer Löhne zu bezahlen, um wettbewerbsfähig zu bleiben. ",
        "Dadurch verbleiben den privaten Haushalten höhere Nettolöhne, ihre Kaufkraft wird gestärkt. Die Menschen können mehr konsumieren.",
        "Durch die gesetzliche Verringerung der Wochenarbeitszeit sind Unternehmen gezwungen, mehr Arbeitskräfte einzustellen. Die neu eingestellten Erwerbstätigen erhöhen mit ihrem Konsum die Gesamtnachfrage.",
        "Damit wird – je nach gewählter Höhe des Mindestlohns – das Lohnniveau der Erwerbstätigen erhöht. Das Konsumniveau und die Gesamtnachfrage steigen.",
        "Das Konsumniveau für einkommensschwache Familien steigt und damit die Gesamtnachfrage.",
        "Je höher die Löhne der Erwerbstätigen, desto mehr können diese durch Konsum die Gesamtnachfrage erhöhen.",
        "Der Staat übernimmt einen Teil der Löhne für Arbeitskräfte in der Hoffnung, dass mehr Unternehmen Arbeitskräfte einstellen. Je mehr Menschen erwerbstätig sind, desto mehr können diese durch Konsum die Gesamtnachfrage erhöhen.",
        "Dadurch wird eine Nachfrage nach Arbeitskräften und z. B. bei Bau- und Handwerksunternehmen geschaffen. Es kommt zu Neueinstellung an Erwerbstätigen."
    ];

    $scope.choicesText = [
        "Senkung der Unternehmenssteuer und der Lohnnebenkosten",
        "Flexibilisierung der Arbeitszeiten, Ermöglichung von Teilzeitarbeit und Befristungen der Arbeitsverträge",
        "Verhinderung bzw. Abschaffung von Mindestlöhnen",
        "Senkung des Lohnniveaus",
        "Lockerung des Kündigungsschutzes",
        "Kürzung von Arbeitslosengeld und Sozialhilfe als Anreiz zur Arbeitsaufnahme",
        "regionale Differenzierung der Löhne",
        "Senkung der Einkommens- und Mehrwertsteuer zur Erhöhung der Konsumgüternachfrage",
        "Verringerung der Wochenarbeitszeit",
        "Einführung bzw. Erhöhung der Mindestlöhne",
        "Erhöhung der Sozialleistungen für einkommensschwache Haushalte",
        "Lohnerhöhungen zur Steigerung der Konsumgüternachfrage",
        "Staatlich subventionierte Nachfrage nach Arbeitskräften in Form eines Kombilohns",
        "Kreditfinanzierte staatliche Investitionen in Bildungsinstitutionen und Infrakstrukturmaßnahmen"
    ];
});

// app.directive('tooltip', function(){
//     return {
//         restrict: 'A',
//         link: function(scope, element, attrs){
//             element.hover(function(){
//                 // on mouseenter
//                 element.tooltip('show');
//             }, function(){
//                 // on mouseleave
//                 element.tooltip('hide');
//             });
//         }
//     };
// });

