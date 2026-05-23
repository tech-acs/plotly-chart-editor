<?php

declare(strict_types=1);

namespace Uneca\PlotlyChartEditor\Events;

use Illuminate\Foundation\Events\Dispatchable;

class ChartSynced
{
    use Dispatchable;

    public function __construct(
        public readonly array $data,
        public readonly array $layout,
    ) {}
}
