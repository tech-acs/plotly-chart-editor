<?php

declare(strict_types=1);

namespace Uneca\PlotlyChartEditor\Support;

use InvalidArgumentException;

class SchemaProfileLoader
{
    /**
     * @param  array<string, mixed>  $config  The full plotly-chart-editor config array.
     */
    public function __construct(
        private readonly array $config,
    ) {}

    /**
     * Return a single resolved profile for the given type.
     * Resolves aliases (e.g. 'line' → 'scatter').
     * Translates all label strings through __().
     *
     * @throws InvalidArgumentException When the type has no profile and is not an alias.
     */
    public function load(string $type): array
    {
        $aliases = $this->config['aliases'] ?? [];
        $profiles = $this->config['profiles'] ?? [];

        // Resolve alias
        $resolvedType = $aliases[$type] ?? $type;

        if (! isset($profiles[$resolvedType])) {
            throw new InvalidArgumentException(
                "No schema profile found for trace type \"{$type}\"."
            );
        }

        return $this->translateProfile($profiles[$resolvedType]);
    }

    /**
     * Return profiles for all types in $traceTypes, resolving aliases.
     * Types that are aliases contribute under their own name (not the target name).
     *
     * @param  array<int, string>  $traceTypes
     * @return array<string, array<mixed>>
     */
    public function loadAll(array $traceTypes): array
    {
        $result = [];

        foreach ($traceTypes as $type) {
            $result[$type] = $this->load($type);
        }

        return $result;
    }

    /**
     * Filter config profiles to only those whose type (or alias target) is
     * present in $traceTypes. Returns the list of enabled type names.
     *
     * @param  array<int, string>  $traceTypes
     * @return array<int, string>
     */
    public function enabledTypes(array $traceTypes): array
    {
        $aliases = $this->config['aliases'] ?? [];
        $profiles = $this->config['profiles'] ?? [];

        return array_values(array_filter($traceTypes, function (string $type) use ($aliases, $profiles): bool {
            $resolved = $aliases[$type] ?? $type;

            return isset($profiles[$resolved]);
        }));
    }

    /**
     * Walk a profile and translate all 'label' string values through __().
     *
     * @param  array<string, mixed>  $profile
     * @return array<string, mixed>
     */
    private function translateProfile(array $profile): array
    {
        $groups = $profile['groups'] ?? [];

        foreach ($groups as $key => $group) {
            if (isset($group['label'])) {
                $groups[$key]['label'] = __($group['label']);
            }

            foreach ($group['fields'] ?? [] as $fi => $field) {
                if (isset($field['label'])) {
                    $groups[$key]['fields'][$fi]['label'] = __($field['label']);
                }
            }
        }

        return array_merge($profile, ['groups' => $groups]);
    }
}
