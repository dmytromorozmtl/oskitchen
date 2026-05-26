# Label template system

- Model: `LabelTemplate` with `type` (legacy string), `packagingLabelType` (`PackagingLabelType` enum), `size`, `contentJson`, optional `layoutJson`.
- Starter templates: `ensureDefaultLabelTemplatesAction` seeds three templates (item, nutrition compact, allergen).
- Printed jobs reference `templateId` and snapshot `type` string on `PrintedLabel`.

Future: visual layout editor writing `layoutJson`.
