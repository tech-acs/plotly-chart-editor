<?php

declare(strict_types=1);

namespace Uneca\PlotlyChartEditor\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidChartConfig implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_array($value)) {
            $fail(__('plotly-chart-editor::plotly-chart-editor.validation.chart_config_array'));

            return;
        }

        if (! isset($value['traces']) || ! is_array($value['traces'])) {
            $fail(__('plotly-chart-editor::plotly-chart-editor.validation.chart_config_traces'));

            return;
        }

        foreach ($value['traces'] as $i => $trace) {
            if (! isset($trace['type'])) {
                $fail(__('plotly-chart-editor::plotly-chart-editor.validation.trace_type_required', ['index' => $i]));
            }
        }

        if (! isset($value['layout']) || ! is_array($value['layout'])) {
            $fail(__('plotly-chart-editor::plotly-chart-editor.validation.chart_config_layout'));
        }
    }
}
