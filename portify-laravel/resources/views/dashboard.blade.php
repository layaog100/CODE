
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard | Portify</title>

    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #f5f7ff;
            color: #1e293b;
        }

        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 18px 7%;
            background: white;
            box-shadow: 0 2px 12px #0000000d;
        }

        .logo {
            color: #4f46e5;
            font-size: 25px;
            font-weight: bold;
        }

        button {
            background: #4f46e5;
            color: white;
            border: none;
            padding: 10px 18px;
            border-radius: 8px;
            cursor: pointer;
        }

        main {
            max-width: 950px;
            margin: 60px auto;
            padding: 20px;
        }

        .welcome {
            background: white;
            padding: 35px;
            border-radius: 18px;
            box-shadow: 0 8px 25px #00000008;
        }

        h1 {
            color: #4338ca;
        }

        .portfolio {
            margin-top: 25px;
            padding: 25px;
            border: 1px solid #e0e7ff;
            border-radius: 14px;
            background: #eef2ff;
        }

        .create-button {
            display: inline-block;
            margin-top: 12px;
            padding: 12px 18px;
            background: #4f46e5;
            color: white;
            text-decoration: none;
            border-radius: 8px;
        }

        footer {
            text-align: center;
            color: #64748b;
            padding: 25px;
        }
    </style>
</head>
<body>

    <nav>
        <div class="logo">Portify.</div>

        <form method="POST" action="{{ route('logout') }}">
            @csrf
            <button type="submit">Log Out</button>
        </form>
    </nav>

    <main>
        <section class="welcome">
            <h1>Welcome, {{ $user->name }}!</h1>
            <p>You are successfully logged in to Portify.</p>
            <p>Create, customize, and manage your online portfolio.</p>

            <div class="portfolio">
                <h2>Your Portfolio Workspace</h2>
                <p>Your dashboard is ready. Next, we'll connect your existing portfolio generator.</p>
                <a href="/portify/index.html" class="create-button">
                    Open Portfolio Generator
                </a>
            </div>
        </section>
    </main>

    <footer>
        © {{ date('Y') }} Portify. Build your future.
    </footer>

</body>
</html>
