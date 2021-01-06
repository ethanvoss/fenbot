const Discord = require('discord.js');
const Canvas = require('canvas');
const { Chess } = require('chess.js');
const chess = new Chess();

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

    if(chess.load(fen))
    {
        const size = 400;
        const squareSize = size/8;
        const canvas = Canvas.createCanvas(size, size);
        const ctx = canvas.getContext('2d');
    
        const background = await Canvas.loadImage('./img/board.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    
        const board = chess.board();
        chess.clear();
        for(var i = 0; i <= 7; i++)
        {
            for(var j = 0; j <= 7; j++)
            {
                const piece = board[i][j];
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
    } else {
        const reason = chess.validate_fen(fen).error;
        message.channel.send(`'${fen}' doesnt seem like a fen to me\n${reason}`);
    }
});

client.login(process.env.token);