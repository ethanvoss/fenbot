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
    const fenString = fen.split(' ')[0];
    while(fenString.startsWith(`"`) || fenString.startsWith(`[`) || fenString.startsWith(`'`)) {
        fenString = fenString.slice(1, fenString.length - 1);
    }

    const pieces = ['K', 'Q', 'R', 'N', 'B', 'P'];

    const fenArray = fenString.split('/');
    for(var r in fenArray)
    {
        const row = fenArray[r].split('');
        for(var c in row)
        {
            var rowbuffer = 0;
            
            if(pieces.some((p) => { return p === row[c] }))
            {
                //whitePiece
                const piece = {};
                piece.type = row[c].toLowerCase();
                piece.color = 'w';
                position[r][c + rowbuffer] = piece;
            } else if(pieces.some((p) => { return p === row[c].toUpperCase() })) 
            {
                //blackPiece
                const piece = {};
                piece.type = row[c].toLowerCase();
                piece.color = 'b';
                position[r][c + rowbuffer] = piece;
            } else {
                //empty
                for(var emptyCounter = 0; emptyCounter < parseInt(row[c]); emptyCounter++)
                {
                    position[r][c + rowbuffer] = null;
                    rowbuffer++;
                }
            }
        }
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