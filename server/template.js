import serialize from 'serialize-javascript';
export default function template(body, initialData, userData){
    return `
    <!DOCTYPE HTML>
    <html>
        <head>
            <meta charset="utf-8">
            <title>Pro MERN Stack</title>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://apis.google.com/js/api:client.js"></script>
            <style>
            table.table-hover tr {cursor: pointer;}
            .panel-title a {display: block; width: 100%; cursor: pointer;}
            </style>
        </head>
        <body>
            <!-- Page generated from template. -->
            <div id="contents">${body}</div>
            <script src="/env.js"></script>
            <script>
            window.__INITIAL_DATA__ = ${serialize(initialData)}
            window.__USER_DATA__ = ${serialize(userData)}
            </script>
            <script src="/vendor.bundle.js"></script>
            <script src="/app.bundle.js"></script>
        </body>
    </html>`
};
