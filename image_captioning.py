import torch
import clip #type: ignore
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration

# Load CLIP model
device = "cuda" if torch.cuda.is_available() else "cpu"
clip_model, preprocess = clip.load("ViT-B/32", device=device)

# Load BLIP model for captioning
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base").to(device)

def describe_image(image_path):
    # Generate a descriptive caption for the uploaded image.
    # Preprocess the image
    image = preprocess(Image.open(image_path)).unsqueeze(0).to(device)
    
    # Generate text with BLIP
    raw_image = Image.open(image_path).convert('RGB')
    inputs = processor(raw_image, return_tensors="pt").to(device)
    
    with torch.no_grad():
        caption = blip_model.generate(**inputs)
    
    return processor.batch_decode(caption, skip_special_tokens=True)[0]

# Test the function
image_path = "PUT IMAGE PATH HERE"
print(describe_image(image_path))
