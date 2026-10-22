<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Portfolio;

class PortfolioController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->portfolios()->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'portfolio_data' => 'required|array',
        ]);

        $portfolio = $request->user()->portfolios()->create([
            'title' => $validated['title'] ?? 'My Portfolio',
            'portfolio_data' => $validated['portfolio_data'],
        ]);

        return response()->json($portfolio, 201);
    }

    public function show(Request $request, string $id)
    {
        $portfolio = $request->user()
            ->portfolios()
            ->findOrFail($id);

        return response()->json($portfolio);
    }

    public function update(Request $request, string $id)
    {
        $portfolio = $request->user()
            ->portfolios()
            ->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'portfolio_data' => 'sometimes|required|array',
        ]);

        $portfolio->update($validated);

        return response()->json($portfolio);
    }

    public function destroy(Request $request, string $id)
    {
        $portfolio = $request->user()
            ->portfolios()
            ->findOrFail($id);

        $portfolio->delete();

        return response()->json([
            'message' => 'Portfolio deleted successfully.',
        ]);
    }
}

