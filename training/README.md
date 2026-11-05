# training/ — legacy TensorFlow 1.x pipeline (preserved)

These files are the **original repository's** retraining and demo scripts,
kept unchanged for provenance. They are **not** used by the AFFECTRA web app —
the deployed system runs the pretrained ONNX FER+ model in `backend/assets/`.

| File                       | What it did in the original project                                  |
| -------------------------- | -------------------------------------------------------------------- |
| `retrain.py`               | Transfer-learning script (MobileNet/Inception retrain on TF-Slim)     |
| `training code.txt`        | The exact command used to run `retrain.py`                           |
| `label_image.py`           | Runs the resulting `retrained_graph.pb` on a single image (TF 1.x)    |
| `recognition_webcam.py`    | Live webcam demo: Haar detect → crop → `label_image` classification   |
| `android_recognition.py`   | Same, but pulls frames from an Android IP Webcam URL                  |
| `Face_crop.py`             | Batch-crops faces from `*.jpg` in a folder, saves them grayscale      |
| `haarcascade_frontalface_alt.xml`   | Cascade used by the legacy scripts                              |
| `haarcascade_frontalface_default.xml` | Reference copy (the app uses `backend/assets/` copy)            |
| `Emotion_recognition.gif`  | Demo recording of the original webcam pipeline                       |

To actually retrain you would need **TensorFlow 1.x** (`pip install
"tensorflow<2"`), a folder-per-class image dataset, and then:

```
python retrain.py --output_graph=retrained_graph.pb \
                  --output_labels=retrained_labels.txt \
                  --architecture=MobileNet_1.0_224 \
                  --image_dir=images
```

Historical note: the legacy pipeline expects you to pre-crop faces with
`Face_crop.py` and convert images to grayscale first. The modern backend does
detection + 64×64 grayscale preprocessing itself at request time.
