
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register | Portify</title>
    <style>
        body { font-family: Arial, sans-serif; background: #eef2ff; display: grid; place-items: center; min-height: 100vh; margin: 0; }
        .card { background: white; padding: 32px; border-radius: 16px; width: min(350px, 85vw); box-shadow: 0 8px 30px #0001; }
        h1 { color: #4338ca; text-align: center; }
        label { display: block; margin-top: 14px; }
        input { box-sizing: border-box; width: 100%; padding: 12px; margin-top: 6px; border: 1px solid #ccc; border-radius: 8px; }
        button { width: 100%; padding: 12px; margin-top: 20px; background: #4f46e5; color: white; border: 0; border-radius: 8px; cursor: pointer; }
        a { color: #4f46e5; }
        .error { color: #b91c1c; font-size: 14px; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Create Account</h1>
        <p>Join Portify and create your portfolio.</p>

        @if ($errors->any())
            <div class="error">
                @foreach ($errors->all() as $error)
                    <p>{{ $error }}</p>
                @endforeach
            </div>
        @endif

        <form method="POST" action="{{ route('register') }}">
            @csrf
            <label for="name">Full name</label>
            <input id="name" name="name" value="{{ old('name') }}" required>

            <label for="email">Email address</label>
            <input id="email" type="email" name="email" value="{{ old('email') }}" required>

            <label for="password">Password (at least 8 characters)</label>
            <input id="password" type="password" name="password" required>

            <label for="password_confirmation">Confirm password</label>
            <input id="password_confirmation" type="password" name="password_confirmation" required>

            <button type="submit">Register</button>
        </form>

        <p>Already have an account? <a href="{{ route('login') }}">Log in</a></p>
    </div>
</body>
</html>
