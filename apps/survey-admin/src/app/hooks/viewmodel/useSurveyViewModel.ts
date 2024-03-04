import React from 'react';
import {
  type SurveySection,
  type Survey,
  useCreateSurvey,
  type SurveyItem as Item,
} from '../query/useServey';
import { insertItem } from '@ssoon-servey/utils';
import { useState } from 'react';
import { produce } from 'immer';
import { itemsType } from '../../types/items.type';

let id = 0;
const genId = () => {
  return ++id;
};

const newItem = (): Item => ({
  title: '',
  type: 'radio',
  required: false,
  options: [{ text: '옵션 1' }],
});
const newSection = (): SurveySection & { id: number } => ({
  id: genId(),
  title: undefined,
  items: [newItem()],
});

const useSurveyViewModel = () => {
  const [toolbarTop, setToolbarTop] = useState(0);
  const [survey, setSurvey] = useState<Omit<Survey, 'sections'>>({
    title: '제목 없는 설문지',
    description: '',
  });

  // 0 0
  // 0 1
  // 1 0으로 되어야 하는데 현재 1 1
  const [currentActiveItemIndex, setCurrentActiveItemIndex] = useState({
    sectionId: 0,
    itemId: 0,
  });

  const [surveySections, setSurveySections] = useState<
    (SurveySection & { id: number })[]
  >([newSection()]);

  const mutate = useCreateSurvey();

  const handleSurveyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.currentTarget;
    setSurvey((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddItems = () => {
    const { sectionId, itemId } = currentActiveItemIndex;
    const nextItemId = itemId + 1;

    setSurveySections((sections) =>
      produce(sections, (sections) => {
        const section = sections[sectionId];
        section.items = insertItem(section.items, nextItemId, newItem());
      })
    );

    setCurrentActiveItemIndex((prev) => ({
      ...prev,
      itemId: nextItemId,
    }));
  };

  const handleAddOption = () => {
    const { sectionId, itemId } = currentActiveItemIndex;
    setSurveySections((sections) =>
      produce(sections, (sections) => {
        const section = sections[sectionId];
        const item = section.items[itemId];
        if (item.options) {
          item.options.push({
            text: `옵션 ${item.options.length + 1}`,
          });
        }
      })
    );
  };

  const handleAddSections = () => {
    const { sectionId } = currentActiveItemIndex;
    const nextSectionId = sectionId + 1;
    setSurveySections((section) =>
      insertItem(section, nextSectionId, newSection())
    );
    setCurrentActiveItemIndex({
      itemId: 0,
      sectionId: nextSectionId,
    });
  };

  const handleActiveItem = (sectionId: number, itemId: number, top: number) => {
    setToolbarTop(top);
    setCurrentActiveItemIndex({ sectionId, itemId });
  };

  const handleChangeItemTitle = (value: string) => {
    const { sectionId, itemId } = currentActiveItemIndex;

    setSurveySections((sections) =>
      produce(sections, (sections) => {
        const section = sections[sectionId];
        const item = section.items[itemId];
        item.title = value;
      })
    );
  };

  const handleChangeItemRequired = (isRequired: boolean) => {
    const { sectionId, itemId } = currentActiveItemIndex;

    setSurveySections((sections) =>
      produce(sections, (sections) => {
        const section = sections[sectionId];
        const item = section.items[itemId];
        item.required = isRequired;
      })
    );
  };

  const handleChangeItemType = (type: itemsType) => {
    const { sectionId, itemId } = currentActiveItemIndex;

    setSurveySections((sections) =>
      produce(sections, (sections) => {
        const section = sections[sectionId];
        const item = section.items[itemId];
        item.type = type;
        if (item.type === 'textarea') {
          item.options = null;
        }
      })
    );
  };

  const handleChangeOptionText = (value: string, optionIndex: number) => {
    const { sectionId, itemId } = currentActiveItemIndex;

    setSurveySections((sections) =>
      produce(sections, (sections) => {
        const section = sections[sectionId];
        const item = section.items[itemId];
        if (item.options) {
          const option = item.options[optionIndex];
          option.text = value;
        }
      })
    );
  };

  const handleDeleteItem = (sectionId: number, itemId: number) => {
    // const { sectionId, itemId } = currentActiveItemIndex;

    setSurveySections((sections) =>
      produce(sections, (sections) => {
        const section = sections[sectionId];
        section.items = section.items.filter((item, i) => i !== itemId);
      })
    );
  };

  const onSubmit = () => {
    mutate({
      title: survey.title,
      description: survey.description,
      sections: surveySections.map((section) => ({
        title: section.title,
        items: section.items,
      })),
    });
  };
  return {
    survey,
    handleSurveyInput,
    surveySections,
    handleActiveItem,
    handleAddOption,
    handleChangeOptionText,
    handleChangeItemTitle,
    handleChangeItemType,
    handleChangeItemRequired,
    handleDeleteItem,
    handleAddItems,
    handleAddSections,
    onSubmit,
    currentActiveItemIndex,
    toolbarTop,
  };
};

export default useSurveyViewModel;
