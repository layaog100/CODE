
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PortfolioController;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware('guest')->group(function () {
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);

    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return view('dashboard', ['user' => Auth::user()]);
    })->name('dashboard');

    Route::get('/portify-user', function () {
        return response()->json([
            'id' => Auth::id(),
            'name' => Auth::user()->name,
            'email' => Auth::user()->email,
        ]);
    });
      
	  Route::get('/portify-csrf', function () {
        return response()->json([
            'token' => csrf_token(),
        ]);
    });
    // Portfolio API routes
    Route::get('/api/portfolios', [PortfolioController::class, 'index']);
    Route::post('/api/portfolios', [PortfolioController::class, 'store']);
    Route::get('/api/portfolios/{id}', [PortfolioController::class, 'show']);
    Route::put('/api/portfolios/{id}', [PortfolioController::class, 'update']);
    Route::delete('/api/portfolios/{id}', [PortfolioController::class, 'destroy']);

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});

