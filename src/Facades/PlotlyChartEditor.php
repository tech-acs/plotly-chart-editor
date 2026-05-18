<?php

namespace Uneca\PlotlyChartEditor\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @see \Uneca\PlotlyChartEditor\PlotlyChartEditor
 */
class PlotlyChartEditor extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return \Uneca\PlotlyChartEditor\PlotlyChartEditor::class;
    }
}
