import * as React from "react";
import {
  Dropdown,
  IDropdownOption,
  Label,
  PrimaryButton,
  Stack,
  TextField,
} from "@fluentui/react";

export interface SimilarityByAbstractPanelProps {
  seedTitle: string;
  seedAbstract: string;
  embeddingIsAda: boolean;
  searchByAbstractLimit: IDropdownOption;
  maxSimilarPapersDropdownOptions: IDropdownOption[];
  onLimitChange: (
    event: React.FormEvent<HTMLDivElement>,
    item: IDropdownOption
  ) => void;
  /** Parent commits title/abstract then runs similarity search */
  onFindSimilar: (title: string, abstract: string) => void;
}

/**
 * Local state for title/abstract so each keystroke does not re-render App.tsx.
 * Parent re-seeds on remount (e.g. embedding type change) via `remountKey`.
 */
export const SimilarityByAbstractPanel: React.FC<SimilarityByAbstractPanelProps> = ({
  seedTitle,
  seedAbstract,
  embeddingIsAda,
  searchByAbstractLimit,
  maxSimilarPapersDropdownOptions,
  onLimitChange,
  onFindSimilar,
}) => {
  const [title, setTitle] = React.useState(seedTitle);
  const [abstract, setAbstract] = React.useState(seedAbstract);

  const findDisabled =
    (!abstract || abstract.trim().length === 0) &&
    (!title || title.trim().length === 0);

  return (
    <>
      <div className="m-t-lg"></div>
      <Stack horizontal tokens={{ childrenGap: 8 }}>
        <Label>Count</Label>
        <Dropdown
          label=""
          selectedKey={searchByAbstractLimit.key}
          onChange={onLimitChange}
          options={maxSimilarPapersDropdownOptions}
          styles={{ root: { minWidth: 90 } }}
        />
        <PrimaryButton
          style={{ zIndex: 2 }}
          text="Find Similar Papers"
          onClick={() => onFindSimilar(title, abstract)}
          allowDisabledFocus
          disabled={findDisabled}
        />
      </Stack>
      <div className="m-t-md"></div>
      {embeddingIsAda ? null : (
        <TextField
          value={title}
          placeholder="Enter your own title here"
          onChange={(_e, v) => setTitle(v || "")}
        />
      )}
      <div className="m-t-md"></div>
      <TextField
        value={abstract}
        placeholder="Enter your own abstract here"
        multiline
        rows={15}
        onChange={(_e, v) => setAbstract(v || "")}
      />
      <div className="m-t-md"></div>
    </>
  );
};
