if(process.env.NODE_ENV !== 'production')
{
	require('dotenv').config();
}


const Discord = require('discord.js');
const Canvas = require('canvas');

const client = new Discord.Client();

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', async message => {
    if (!message.content.startsWith(process.env.prefix) || message.author.bot) return;

    const args = message.content.slice(process.env.prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
    var fen = "";
    for(var i in args) {
        if(i > 0) fen += " ";
        fen += args[i];
    }

    const size = 400;
    const squareSize = size/8;
    const canvas = Canvas.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    const background = await Canvas.loadImage('./img/board.png');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const position = [];
    var fenString;
    if(fen.split(' ')[0] === '[FEN') fenString = fen.split(' ')[1];
    else fenString = fen.split(' ')[0];

    while(fenString.startsWith(`"`) || fenString.startsWith(`[`) || fenString.startsWith(`'`)) {
        fenString = fenString.slice(1, fenString.length);
    }
    while(fenString.endsWith(`"`) || fenString.endsWith(`]`) || fenString.endsWith(`'`)) {
        fenString = fenString.slice(0, -1);
    }

    console.log(fenString);

    const pieces = ['K', 'Q', 'R', 'N', 'B', 'P'];

    const fenArray = fenString.split('/');
    for(var r in fenArray)
    {
        const row = fenArray[r].split('');
        const pushRow = [];
        for(var c in row)
        {
            if(pieces.some((p) => { return p === row[c] }))
            {
                //whitePiece
                const piece = {
                    type : row[c].toLowerCase(),
                    color : 'w'
                };
                pushRow.push(piece);
            } else if(pieces.some((p) => { return p === row[c].toUpperCase() })) 
            {
                //blackPiece
                const piece = {
                    type : row[c].toLowerCase(),
                    color : 'b'
                };
                pushRow.push(piece);
            } else {
                //empty
                for(var emptyCounter = 0; emptyCounter < parseInt(row[c]); emptyCounter++)
                {
                    pushRow.push(null);
                }
            }
        }
        position.push(pushRow);
    }

    for(var i = 0; i <= 7; i++)
    {
        for(var j = 0; j <= 7; j++)
        {
            const piece = position[i][j];
            if(piece !== null) {
                var url = `./img/pieces/${piece.color}${piece.type.toUpperCase()}.png`;
                var x = j * squareSize;
                var y = i * squareSize;
                const pieceImg = await Canvas.loadImage(url);
                ctx.drawImage(pieceImg, x, y, squareSize, squareSize);
            }
        }
    }

    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'board-image.png');

    message.channel.send(fen, attachment);
});

client.login(process.env.token);