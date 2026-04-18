import json
import redis
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from .models import Prompt


def get_redis_client():
    return redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        db=0,
        decode_responses=True
    )


@csrf_exempt
@require_http_methods(["GET", "POST"])
def prompt_list(request):
    if request.method == "GET":
        prompts = Prompt.objects.all().values(
            "id", "title", "content", "complexity", "created_at"
        )
        data = []
        for p in prompts:
            item = dict(p)
            item["created_at"] = item["created_at"].isoformat()
            data.append(item)
        return JsonResponse(data, safe=False)

    elif request.method == "POST":
        try:
            body = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON body."}, status=400)

        title = body.get("title", "").strip()
        content = body.get("content", "").strip()
        complexity = body.get("complexity")

        errors = {}

        if len(title) < 3:
            errors["title"] = "Title must be at least 3 characters."
        if len(content) < 20:
            errors["content"] = "Content must be at least 20 characters."
        if complexity is None:
            errors["complexity"] = "Complexity is required."
        else:
            try:
                complexity = int(complexity)
                if complexity < 1 or complexity > 10:
                    errors["complexity"] = "Complexity must be between 1 and 10."
            except (ValueError, TypeError):
                errors["complexity"] = "Complexity must be an integer between 1 and 10."

        if errors:
            return JsonResponse({"errors": errors}, status=400)

        prompt = Prompt.objects.create(
            title=title,
            content=content,
            complexity=complexity
        )

        return JsonResponse({
            "id": prompt.id,
            "title": prompt.title,
            "content": prompt.content,
            "complexity": prompt.complexity,
            "created_at": prompt.created_at.isoformat()
        }, status=201)


@require_http_methods(["GET"])
def prompt_detail(request, prompt_id):
    try:
        prompt = Prompt.objects.get(id=prompt_id)
    except Prompt.DoesNotExist:
        return JsonResponse({"error": "Prompt not found."}, status=404)

    try:
        r = get_redis_client()
        key = f"prompt:{prompt.id}:views"
        view_count = r.incr(key)
    except Exception:
        view_count = 0

    return JsonResponse({
        "id": prompt.id,
        "title": prompt.title,
        "content": prompt.content,
        "complexity": prompt.complexity,
        "created_at": prompt.created_at.isoformat(),
        "view_count": view_count
    })
