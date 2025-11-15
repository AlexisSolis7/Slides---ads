<script setup>
  import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
  
  const slides = ref([])
  // inicialização
  onMounted(async () => {
    let resposta = await fetch("http://localhost:4000/getSlides");
    slides.value = await resposta.json();
    
    // verificação de expiração no momento de montagem
    const tempoAtual = new Date()
    const slidesValidos = slides.value.filter((slide) => new Date(slide.expiracao) > tempoAtual)

    slides.value = slidesValidos
    if (slides.value.length > 0) temporizaSlide()
  })

  // façamos os slides serem substituídos temporalmente
  const index = ref(0)
  const slideAtual = computed(() => {
    if (!slides.value.length) return null
    return slides.value[index.value] 
  })

  let timerId = null
  const temporizaSlide = () => {
    if (timerId) clearTimeout(timerId)
    if (!slideAtual.value) return
    timerId = setTimeout(() => {
      index.value = (index.value + 1) % slides.value.length // dessa forma retorna-se para 0 caso ultrapasse o length
    }, slideAtual.value.duracao * 200) // por enquanto acelerado em 5x xD
  }
  watch(index, temporizaSlide) // quando index mudar, o próximo slide é setado após o tempo de duração atual

  // fechamento: queremos que os timers resetem, evitar vazamento de memoria
  onUnmounted(() => clearTimeout(timerId))
</script>
 
<template>
  <div v-if="slideAtual">
    <div v-html="slideAtual.conteudo"></div>
  </div>
</template>

<style scoped></style>
