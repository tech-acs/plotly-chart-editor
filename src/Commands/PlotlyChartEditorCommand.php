<?php

namespace Uneca\PlotlyChartEditor\Commands;

use Illuminate\Console\Command;

class PlotlyChartEditorCommand extends Command
{
    public $signature = 'plotly-chart-editor';

    public $description = 'My command';

    public function handle(): int
    {
        $this->comment('All done');

        return self::SUCCESS;
    }
}
