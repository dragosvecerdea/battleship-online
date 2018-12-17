var connection = new WebSocket("ws://localhost:3000");
var GAMEDONE = false;
var allowed = false;

mytable = [];
enemytable = []; // what was already clicked 
alive = [];
alive[0] = 0;
var shipno =1;
var rotate = 1;
var antirotate=0;
var placeable = false;
var noShipsAvailable = false; 
available = [];
function initialize(){
    
    placeable = false;
    GAMEDONE = false;
    rotate=1;
    antirotate=0;
    shipno=1;
    noShipsAvailable = false;
    for(var i = 1;i <= 3; i++) available[i] = 2;
    for(var i = 1;i <= 10; i++)
    {
        mytable[i]=[];
        enemytable[i]=[];
        for(var j = 0;j <= 9; j++)
        {
            mytable[i][j]=0;
            enemytable[i][j]= false;
            let position = (i-1)*10;
            position += j;
            document.getElementById(position+'two').style.backgroundColor = 'transparent';
            document.getElementById(position+'one').style.backgroundColor = 'transparent';
            $("#type3").attr('src', "media/GR2.png");
            $("#type2").attr('src', "media/SP2.png");
            $("#type1").attr('src', "media/UFO2.png");
            $("#type1").fadeIn();
            $("#type2").fadeIn();
            $("#type3").fadeIn();
            $("#rotate").fadeIn();
            $("#ready").remove();
        }
    }
}
connection.onopen = function()
{
    connection.send("PLAY");
};
connection.onmessage = function(event)
{
    if(event.data.includes("LEFT"))
    {
        connection.send("PLAY");
        initialize();
        return;
    }
    if(event.data === "MOVE")
    {
        $("#messageBox").val("Your turn: Choose a cell to attack");
        allowed = true;
        return;
    }
    if(event.data === "LOST")
    {
        $("#messageBox").val("YOU LOST");
        GAMEDONE = true;
        return;
    }
    if(event.data === "WIN")
    {
        $("#messageBox").val("YOU WON");
        GAMEDONE = true;
        return;
    }
    if(event.data === "PLACE")
    {
        $("#messageBox").val("Place your ships");
        placeable = true;
    }
    if(event.data.includes("WAIT"))
    {
        $("#messageBox").val("Searching for opponent");
    }
    if(event.data.includes("VERIFY"))
    {
        console.log("I VERIFIED");
        let position = parseInt(event.data);
        let posx = parseInt(position/10)+1;
        let posy = position%10;
        if(mytable[posx][posy] != 0)
        {
            alive[mytable[posx][posy]] --;
            if(alive[mytable[posx][posy]] == 0)
            {
                for(var i=1;i<=10;i++){
                    for(var j=0;j<=9;j++)
                    {
                        if(mytable[i][j] === mytable[posx][posy])
                        {
                            document.getElementById((i-1)*10+j+"one").style.backgroundColor = 'Black';
                            document.getElementById((i-1)*10+j+"one").style.opacity = 0.7;
                        }
                    }
                }

                connection.send(position+"HIT");
            }
            else
            {
                document.getElementById(position+"one").style.opacity = 0.4;
                connection.send(position+"HIT");
            }
            var gamecontinues = false;
            for(let i=1;i<=6;i++)
            {
                if(alive[i] != 0) gamecontinues = true;
            }
            if(!gamecontinues) connection.send("ILOST");
        }
        else
        {
            connection.send(position+"MISS");
        }
    }
    if (event.data.includes("MISS")){
        let position = parseInt(event.data) + 'two';
        console.log(position);
       
        document.getElementById(position).style.backgroundColor = 'DimGray';
        document.getElementById(position).style.opacity = 1;
        
        var posx = parseInt(parseInt(position)/10) +1;
        var posy = parseInt(position)%10;
        enemytable[posx][posy] = true;
       
        $("#messageBox").val("It's the opponent's turn");
    }
    if (event.data.includes("HIT")){
        let position = parseInt(event.data) + 'two';
        console.log(position);
        
        document.getElementById(position).style.backgroundColor = 'Red';
        document.getElementById(position).style.opacity = 1;
        
        var posx = parseInt(parseInt(position)/10) +1;
        var posy = parseInt(position)%10;
        enemytable[posx][posy] = true;
        
        $("#messageBox").val("It's th eopponent's turn");
    }
    if (event.data.includes("OPTURN"))
    {
        $("#messageBox").val("It's the opponent's turn");
    }
}
function tableCreate(name){
    var body = document.body, table  = document.createElement('table');
    table.id = name; 
    var letter = "ABCDEFGHIJ";
    for(var i = 0; i <= 10; i++)
    {
        var tr = table.insertRow();
        for(var j = 0; j <= 10; j++){

            //var td = tr.insertCell();
            if (i == 0 && j != 0)
            {
                var nextChar = letter.charAt(j - 1);
                //td.appendChild(document.createTextNode(nextChar));
            }

            if (j == 0 && i != 0)
            {
                //td.appendChild(document.createTextNode(i));
            }

            if (j != 0 && i != 0)
            {
                var td = tr.insertCell();
                td.style.border = '5px solid black';
                td.id = ((i-1)*10 + j-1).toString();
                if(name == 'player1') td.id += "one";
                if(name == 'player2') td.id += "two";
            }
        }
    }
    body.appendChild(table);
}
function complete(type,coordx,coordy)
{
    mytable[coordx][coordy]=shipno;
    var position = (coordx-1)*10;
    position += coordy;
    if(type === 1)
    {
        document.getElementById((position).toString()+'one').style.opacity = 1;
        alive[shipno]=1;
    }
    if(type === 2)
    {
        document.getElementById((position+rotate+10*antirotate).toString()+'one').style.opacity = 1;
        document.getElementById((position).toString()+'one').style.opacity = 1;
        mytable[coordx+antirotate][coordy+rotate]=shipno;
        alive[shipno]=2;
    }
    if(type === 3)
    {
        document.getElementById((position+rotate+10*antirotate).toString()+'one').style.opacity = 1;
        document.getElementById((position-rotate-10*antirotate).toString()+'one').style.opacity = 1;
        document.getElementById((position).toString()+'one').style.opacity = 1;
        mytable[coordx-antirotate][coordy-rotate]=shipno;
        mytable[coordx+antirotate][coordy+rotate]=shipno;
        alive[shipno]=3;
    }
    shipno++;
}
function verify(id,type)
{
    var coordx = parseInt(id/10+1);
    var coordy = id%10;
    if(type === 3)
    {
        if(mytable[coordx][coordy] > 0 || mytable[coordx+antirotate][coordy+rotate] > 0 || mytable[coordx-antirotate][coordy-rotate] > 0 ) return false;
        else return true;
    }
    if(type === 2)
    {
        if(mytable[coordx][coordy] > 0 || mytable[coordx+antirotate][coordy+rotate] > 0) return false;
        else return true;
    }
    if(type === 1)
    {
        if(mytable[coordx][coordy] === 1) return false;
        else return true;
    }
}
function completeout(type,coordx,coordy)
{
    var position = (coordx-1)*10;
    position += coordy;
    if(type == 1)
    {
        document.getElementById((position).toString()+'one').style.backgroundColor = 'transparent';
    }
    if(type == 2)
    {
        if(mytable[coordx+antirotate][coordy+rotate] == 0)document.getElementById((position+rotate+10*antirotate).toString()+'one').style.backgroundColor = 'transparent';
        document.getElementById((position).toString()+'one').style.backgroundColor = 'transparent';
    }
    if(type == 3)
    {
        if(mytable[coordx+antirotate][coordy+rotate] == 0)document.getElementById((position+rotate+10*antirotate).toString()+'one').style.backgroundColor = 'transparent';
        if(mytable[coordx-antirotate][coordy-rotate] == 0)document.getElementById((position-rotate-10*antirotate).toString()+'one').style.backgroundColor = 'transparent';
        document.getElementById((position).toString()+'one').style.backgroundColor = 'transparent';
    }
    if(type === "two")
    {
        document.getElementById((position).toString()+'two').style.backgroundColor = 'transparent';
    }
}
function completeover(type,coordx,coordy)
{
    var position = (coordx-1)*10;
    position += coordy;
    if(type == 1)
    {
        document.getElementById((position).toString()+'one').style.backgroundColor = 'LimeGreen';
        document.getElementById((position).toString()+'one').style.opacity = 0.6;
    }
    if(type == 2)
    {
        if(mytable[coordx+antirotate][coordy+rotate] == 0)
        {
            document.getElementById((position).toString()+'one').style.backgroundColor = 'Yellow';
            document.getElementById((position).toString()+'one').style.opacity = 0.6;
            document.getElementById((position+rotate+10*antirotate).toString()+'one').style.backgroundColor = 'Yellow';
            document.getElementById((position+rotate+10*antirotate).toString()+'one').style.opacity = 0.6;
        }
    }
    if(type == 3)
    {
        if(mytable[coordx-antirotate][coordy-rotate] == 0 && mytable[coordx+antirotate][coordy+rotate] == 0) 
        {
            document.getElementById((position+10*antirotate+rotate).toString()+'one').style.backgroundColor = 'DarkTurquoise';
            document.getElementById((position+10*antirotate+rotate).toString()+'one').style.opacity = 0.6;
            document.getElementById((position-10*antirotate-rotate).toString()+'one').style.backgroundColor = 'DarkTurquoise';
            document.getElementById((position-10*antirotate-rotate).toString()+'one').style.opacity = 0.6;
            document.getElementById((position).toString()+'one').style.backgroundColor = 'DarkTurquoise';
            document.getElementById((position).toString()+'one').style.opacity = 0.6;
        }
    }
    if(type === "two")
    {
        document.getElementById((position).toString()+'two').style.backgroundColor = 'Black';
        document.getElementById((position).toString()+'two').style.opacity = 0.3;
    }

}
var main = function start(){
    tableCreate('player1');
    tableCreate('player2');
    initialize();
    var type = 1;
    $("#type1").on("click" , function()
    {
        type = 1;
    });
    $("#type2").on("click" , function()
    {
        type = 2;
    });
    $("#type3").on("click" , function()
    {
        type = 3;
    });
    $("#rotate").on("click" , function()
    {
        rotate = 1-rotate;
        antirotate = 1-antirotate;
    });

    $("td").on("mouseover",function()
    {
        
        var position = parseInt(this.id);
        var posx = parseInt(position/10) +1;
        var posy = position%10;
        if(this.id.includes('one') && mytable[posx][posy] == 0 && available[type] > 0)
        {
            if(type==1)
            {
                completeover(1,posx,posy);
            }
            if(type==3 && ((antirotate && posy>= 0 && posy<=9) || (rotate && posy>=1 && posy <=8)))
            {
                completeover(3,posx,posy);
            }
            if(type==2 && ((antirotate &&  posx<10) || (rotate && posy<9)))
            {
                completeover(2,posx,posy);
            } 
        }

        else if(noShipsAvailable === true && this.id.includes('two') && enemytable[posx][posy] === false )
        {
            completeover("two",posx,posy);    
        }

    });
    $("td").on("mouseout", function()
     {
        var position = parseInt(this.id);
        var posx = parseInt(position/10) +1;
        var posy = position%10;
        if(this.id.includes('one') && mytable[posx][posy] == 0)
            {
            if(type===1)
            {
                completeout(1,posx,posy);
            }
            if(type===3)
            {
                completeout(3,posx,posy);
            }
            if(type===2)
            {
                completeout(2,posx,posy);
            }
        }
        else if(this.id.includes('two') && enemytable[posx][posy] === false)
        {
            completeout("two",posx,posy);
        }
    });
    $("td").on("click" , function() {     

        //this.style.color = red;  
        //$("#result").html( this.id );   
        var cell = document.getElementById(this.id);
        var position = parseInt(cell.id);
        var posx = parseInt(position/10) +1;
        var posy = position%10;
        if(this.id.includes('one') && placeable)
        {
           if(type === 1 && verify(parseInt(cell.id),1) && available[type]) 
           {
               
                available[type] --;
                complete(1,posx,posy);

                $('#type1').attr('src', "media/UFO1.png");
                if(available[1] === 0)
                {
                    $("#type1").fadeOut();
                }
           }
           if(type === 2 && verify(parseInt(cell.id),2) && available[type] &&  ((antirotate && posx<=9) || (posy<9 && rotate))) 
           {
               
                available[type] --;
                complete(2,posx,posy);

                $("#type2").attr('src', "media/SP1.png");
                if(available[2] === 0)
                {
                    $("#type2").fadeOut();
                }
           }
           if(type === 3 && verify(parseInt(cell.id),3) && available[type] && ((posx >= 1 && antirotate && posx<=9) || (posy>=1 && rotate && posy<=9))) 
           {
               available[type]--;
               complete(3,posx,posy);

               $("#type3").attr('src', "media/GR1.png");
               if(available[3] === 0)
               {
                   $("#type3").fadeOut();
               }
           }

           if(available[1] == 0  && available[3] == 0 && available[2]  == 0 && noShipsAvailable === false)
           {
               noShipsAvailable = true;

               $("#rotate").fadeOut();
               var $newButton = $("<input>" , {type: "image" , id: "ready"});
               //$newButton.text("READY!");
               $newButton.attr('src', "media/Ready.png");
               $newButton.hide();
               $newButton.on("click", function()
               {
                   connection.send("DONE");
                   $("#messageBox").val("Waiting for opponent to place his ships");
                   $("#ready").fadeOut();
               });
               $(".buttons").append($newButton);
               
               setTimeout(function() {
                $newButton.fadeIn();
               },700);
               
               $("#messageBox").val("Press READY to continue!");
           }
        
        } 
        if (this.id.includes('two'))
        {
            if (allowed && !GAMEDONE && enemytable[posx][posy] == false)
            {
                connection.send(parseInt(cell.id) + 'PC');
                allowed = false;
            }
            if(enemytable[posx][posy] == true)
            {
                $("#messageBox").val("Choose another cell to attack!");
            }
        }
        
    });
     // $("#messageBox").val("Place your ships!");
}
$(document).ready(main);
