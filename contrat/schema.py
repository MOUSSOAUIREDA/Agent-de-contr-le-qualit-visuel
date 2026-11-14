from typing import Literal

from pydantic import BaseModel, Field, model_validator


class Detection(BaseModel):
    label: Literal["Bubble", "Plastering thread", "Black spot", "Oil", "Quenched grain"]

    confidence: float = Field(ge=0, le=1)

    bbox: tuple[int, int, int, int]

    @model_validator(mode="after")
    def validate_bbox(self):
        x_min, y_min, x_max, y_max = self.bbox

        if x_min >= x_max or y_min >= y_max:
            raise ValueError("Invalid bounding box coordinates")

        return self


class Reponse(BaseModel):
    image: str

    status: Literal["defects_detected", "no_defect"]

    detections: list[Detection]

    @model_validator(mode="after")
    def validate_status(self):
        if self.detections and self.status != "defects_detected":
            raise ValueError("Inconsistent status")

        if not self.detections and self.status != "no_defect":
            raise ValueError("Inconsistent status")

        return self
