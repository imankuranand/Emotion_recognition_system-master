"""Emotion class definitions for the FER+ model.

Index order matches the official ONNX Model Zoo Emotion FERPlus label table:
    {'neutral':0, 'happiness':1, 'surprise':2, 'sadness':3,
     'anger':4, 'disgust':5, 'fear':6, 'contempt':7}
"""

from __future__ import annotations

EMOTIONS: list[str] = [
    "neutral",
    "happiness",
    "surprise",
    "sadness",
    "anger",
    "disgust",
    "fear",
    "contempt",
]

MODEL_NAME = "emotion-ferplus-8"
MODEL_FULL_NAME = "Emotion FERPlus (ONNX Model Zoo)"
MODEL_SOURCE = "https://huggingface.co/onnxmodelzoo/emotion-ferplus-8"
MODEL_PAPER = "Barsoum et al., arXiv:1608.01041 (FER+ crowd-sourced labels)"
INPUT_SIZE = 64
