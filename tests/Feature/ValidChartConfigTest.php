<?php

declare(strict_types=1);

use Uneca\PlotlyChartEditor\Rules\ValidChartConfig;

it('passes for a valid chart config', function (): void {
    $rule = new ValidChartConfig;
    $failed = false;

    $rule->validate('chart', [
        'traces' => [
            ['type' => 'bar', 'name' => 'T1'],
            ['type' => 'scatter', 'name' => 'T2'],
        ],
        'layout' => ['title' => ['text' => 'Test']],
    ], function (string $message) use (&$failed): void {
        $failed = true;
    });

    expect($failed)->toBeFalse();
});

it('fails when value is not an array', function (): void {
    $rule = new ValidChartConfig;
    $failed = false;

    $rule->validate('chart', 'not-an-array', function (string $message) use (&$failed): void {
        $failed = true;
    });

    expect($failed)->toBeTrue();
});

it('fails when traces key is missing', function (): void {
    $rule = new ValidChartConfig;
    $failed = false;

    $rule->validate('chart', ['layout' => []], function (string $message) use (&$failed): void {
        $failed = true;
    });

    expect($failed)->toBeTrue();
});

it('fails when a trace is missing type', function (): void {
    $rule = new ValidChartConfig;
    $failed = false;
    $message = '';

    $rule->validate('chart', [
        'traces' => [
            ['name' => 'Missing type'],
        ],
        'layout' => [],
    ], function (string $msg) use (&$failed, &$message): void {
        $failed = true;
        $message = $msg;
    });

    expect($failed)->toBeTrue();
});

it('fails when layout key is missing', function (): void {
    $rule = new ValidChartConfig;
    $failed = false;

    $rule->validate('chart', [
        'traces' => [['type' => 'bar']],
    ], function (string $message) use (&$failed): void {
        $failed = true;
    });

    expect($failed)->toBeTrue();
});
