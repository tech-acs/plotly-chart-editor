{{--
  Reference demo for uneca/plotly-chart-editor.
  This is what a consumer application's Blade view looks like when using the component.

  Assumptions for this demo:
    1. Plotly.js is loaded via CDN (peer dependency). See <head>.
    2. Livewire scripts are loaded (via @livewireScripts at end of body).
    3. The package's CSS and JS bundles are pulled in via Vite or @vite() in the consuming app.
    4. The variable $countries is provided by the route/controller and matches the shape in fixtures/african-countries.json.

  In an actual Laravel app the route would look like:

      Route::get('/plotly-demo', function () {
          return view('plotly-demo', [
              'countries' => json_decode(file_get_contents(base_path('fixtures/african-countries.json')), true),
          ]);
      });
--}}
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Plotly Chart Editor — Demo</title>

    {{-- Peer dependency: Plotly.js must be available as window.Plotly BEFORE Alpine boots. --}}
    <script src="https://cdn.plot.ly/plotly-3.5.0.min.js" charset="utf-8"></script>

    {{-- Package assets — replace with your @vite() directive in a real app. --}}
    <link rel="stylesheet" href="/vendor/plotly-chart-editor/plotly-chart-editor.css">
    <script src="/vendor/plotly-chart-editor/plotly-chart-editor.js" defer></script>

    @livewireStyles
</head>
<body>
    <main style="padding: 24px; max-width: 1400px; margin: 0 auto;">
        <h1 style="font-family: system-ui, sans-serif;">Plotly Chart Editor — Demo</h1>

        <livewire:plotly-editor
            :data-sources="$countries"
            :data="[
                [
                    'type' => 'bar',
                    'name' => 'Population (millions)',
                    'meta' => ['columnNames' => ['x' => 'Country', 'y' => 'Population']],
                    'marker' => ['color' => '#1f77b4'],
                ],
                [
                    'type' => 'box',
                    'name' => 'Life expectancy',
                    'meta' => ['columnNames' => ['y' => 'LifeExpectancy']],
                    'fillcolor' => '#2ca02c',
                ],
            ]"
            :layout="[
                'title' => ['text' => 'African Countries by Population'],
                'xaxis' => ['title' => ['text' => 'Country']],
                'yaxis' => ['title' => ['text' => 'Population (millions)']],
                'margin' => ['t' => 60, 'b' => 80, 'l' => 70, 'r' => 30],
            ]"
            :trace-types="['bar', 'line', 'scatter', 'pie', 'histogram', 'box']"
            :sync-mode="'hybrid'"
            :preload-schema="true"
            :show-export="true"
        />
    </main>

    @livewireScripts

    {{--
      Optional: listen for the chart-synced event from the editor.
      Payload contract: { data, layout }
    --}}
    <script>
        document.addEventListener('livewire:init', () => {
            Livewire.on('chart-synced', (event) => {
                // Persist to your backend here.
            });
        });
    </script>
</body>
</html>
