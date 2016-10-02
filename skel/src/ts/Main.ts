import { just, combine, Stream } from 'most';
import { div, a, nav, VNode } from '@cycle/dom';
import { DOMSource } from '@cycle/dom/most-typings';
import { RouterSource } from 'cyclic-router/most-typings';
import { merge, prop } from 'ramda';
import About from './About';
import BMI from './BMI';
import NotFound from './NotFound';

export type Sources = {
  DOM: DOMSource,
  router: RouterSource,
};
export type Sinks = {
  DOM: Stream<VNode>,
  router: Stream<string>,
};

export default function Main(sources: Sources): Sinks {
  const match$ = sources.router.define({
    '/': About,
    '/bmi': BMI,
    '*': NotFound,
  });

  const page$ = match$.map(({path, value}) => value(merge(sources, {
    path: sources.router.path(path),
  })));

  const makeLink = (path: string, label: string) => a({ props: { href: path }, style: { padding: '1em' } }, label);

  const nav$ = just(nav({ style: { marginBottom: '1em' } }, [
    makeLink('/bmi', 'BMI'),
    makeLink('/about', 'About'),
  ]));

  const view$ = page$.flatMap(prop('DOM'));

  const vdom$ = combine((navDom, viewDom) => div([navDom, viewDom]), nav$, view$);

  return {
    DOM: vdom$,
    router: just('/'),
  };
};