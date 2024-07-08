<?php

//dd($page['props']['test']);

?>

<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1 " />

        @if (isset($page['props']['title']))
            <title>Picuss - {{ $page['props']['title'] }}</title>
        @else
            <title>Picuss</title>
        @endif

        @if(isset($page['props']['meta']))
            @foreach ($page['props']['meta'] as $key => $value)
                <meta property="{{ $key }}" content="{{ $value }}" />
            @endforeach
        @else
            <meta property="og:title" content="Picuss - Photo gallery"/>
            <meta property="og:description" content="A tag based photo gallery for fast photo search and easy album management"/>
            <meta property="og:title" content="{{ url()->current() }}"/>
            <meta property="og:image" content="{{ URL::to('/') }}/logo.svg"/>
        @endif
        

        @viteReactRefresh 
        @vite(['resources/scss/app.scss', 'resources/js/app.jsx'])
        <!-- As you can see, we will use vite with jsx syntax for React-->
        @inertiaHead
        @routes
    </head>
    <body>
        @inertia
    </body>
</html>